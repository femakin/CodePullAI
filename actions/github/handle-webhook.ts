// Helper: Parse a unified diff into file changes (MVP, not robust)
export function parseDiff(diff: string) {
  const files: any[] = [];
  const fileBlocks = diff.split(/^diff --git /m).slice(1);
  for (const block of fileBlocks) {
    const lines = block.split("\n");
    const fileLine = lines[0];
    const filename = fileLine.split(" b/").pop()?.trim() || "unknown";
    const changes: { type: string; content: string }[] = [];
    for (const line of lines) {
      if (line.startsWith("+ ") || (line.startsWith("+") && !line.startsWith("+++"))) {
        changes.push({ type: "added", content: line.substring(1) });
      } else if (line.startsWith("- ") || (line.startsWith("-") && !line.startsWith("---"))) {
        changes.push({ type: "removed", content: line.substring(1) });
      }
    }
    files.push({ filename, changes });
  }
  return files;
}

interface ReviewComment {
  file: string;
  line: string;
  comment: string;
  severity: "low" | "medium" | "high";
}

export async function getAIReview(files: any[], prTitle: string): Promise<ReviewComment[]> {
  const prompt = `
You are an expert code reviewer. Analyze the following code changes from a pull request titled "${prTitle}".

Provide specific, actionable feedback focusing on:
1. Potential bugs or errors
2. Security vulnerabilities 
3. Performance improvements
4. Code style and best practices
5. Maintainability concerns

Code changes:
${files.map(f => `File: ${f.filename}\n` +
    f.changes.map((c: { type: string, content: string }) =>
      `${c.type === "added" ? "+" : "-"} ${c.content}`
    ).join("\n")
  ).join("\n\n")}

IMPORTANT: Return ONLY a valid JSON array. Each object must have exactly these fields:
- "file": string (filename)
- "line": string (line content) 
- "comment": string (your review comment)
- "severity": string ("low", "medium", or "high")

Example format:
[{"file":"example.js","line":"const x = 1","comment":"Consider using more descriptive variable names","severity":"low"}]
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY!}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert code reviewer. Always respond with valid JSON arrays only."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500, // Increased for better responses
        temperature: 0.3 // Lower temperature for more consistent responses
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn("No content received from OpenAI");
      return [];
    }

    // Parse the response with multiple fallback strategies
    return parseAIResponse(content);

  } catch (error) {
    console.error("Failed to get AI review:", error);
    return [];
  }
}

function parseAIResponse(content: string): ReviewComment[] {
  try {
    // Strategy 1: Direct JSON parse
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return validateAndCleanReviews(parsed);
    }
  } catch (error) {
    // Strategy 2: Extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed)) {
          return validateAndCleanReviews(parsed);
        }
      } catch (e) {
        console.warn("Failed to parse JSON from code block");
      }
    }

    // Strategy 3: Find JSON array pattern in text
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        const parsed = JSON.parse(arrayMatch[0]);
        if (Array.isArray(parsed)) {
          return validateAndCleanReviews(parsed);
        }
      } catch (e) {
        console.warn("Failed to parse extracted JSON array");
      }
    }

    // Strategy 4: Try to fix common JSON issues
    const fixedContent = fixCommonJsonIssues(content);
    try {
      const parsed = JSON.parse(fixedContent);
      if (Array.isArray(parsed)) {
        return validateAndCleanReviews(parsed);
      }
    } catch (e) {
      console.warn("Failed to parse fixed JSON");
    }

    // Strategy 5: Parse line by line if it looks like separate objects
    if (content.includes('{"file"')) {
      const objects = content.match(/\{"file"[^}]*\}/g);
      if (objects) {
        const validObjects: ReviewComment[] = [];
        objects.forEach(obj => {
          try {
            const parsed = JSON.parse(obj);
            if (isValidReviewComment(parsed)) {
              validObjects.push(parsed);
            }
          } catch (e) {
            // Skip invalid objects
          }
        });
        return validObjects;
      }
    }
    console.warn("Could not parse AI response as JSON:", content);
    return [];
  }
  // Ensure a return in all code paths
  return [];
}
  


function fixCommonJsonIssues(content: string): string {
  return content
    // Remove markdown formatting
    .replace(/```json\s*|\s*```/g, '')
    // Fix trailing commas
    .replace(/,(\s*[}\]])/g, '$1')
    // Fix single quotes to double quotes
    .replace(/'/g, '"')
    // Remove any text before the first [
    .replace(/^[^[]*/, '')
    // Remove any text after the last ]
    .replace(/[^\]]*$/, '');
}

function validateAndCleanReviews(reviews: any[]): ReviewComment[] {
  return reviews
    .filter(isValidReviewComment)
    .map(review => ({
      file: String(review.file || ''),
      line: String(review.line || ''),
      comment: String(review.comment || ''),
      severity: ['low', 'medium', 'high'].includes(review.severity)
        ? review.severity
        : 'medium'
    }));
}

function isValidReviewComment(obj: any): obj is ReviewComment {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.file === 'string' &&
    typeof obj.line === 'string' &&
    typeof obj.comment === 'string' &&
    typeof obj.severity === 'string'
  );
}

// Alternative: More robust version with retry logic
export async function getAIReviewWithRetry(files: any[], prTitle: string, maxRetries = 2): Promise<ReviewComment[]> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await getAIReview(files, prTitle);
      if (result.length > 0) {
        return result;
      }

      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt + 1} returned empty results, retrying...`);
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries) {
        return [];
      }
    }
  }

  return [];
}


export async function postGitHubComment(commentsUrl: string, review: any, token: string) {

  try {
    const response = await fetch(commentsUrl, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: `🤖 **AI Code Review** (${review.severity} priority)\n\n**File:** \`${review.file}\`\n**Line:** \`${review.line}\`\n\n${review.comment}`,
      }),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error posting GitHub comment:", error);
  }
}

export async function processReview(files: any[], prTitle: string, commentsUrl: string, token: string) {


  const aiReview = await getAIReview(files, prTitle);

  console.log(aiReview[0], "ai Review aiReview[0]  ")

  console.log(aiReview[0].line, "ai Review aiReview[0]  ")

  // let reviewComments = [];
  // try {
  //   reviewComments = JSON.parse(aiReview);
  // } catch (e) {
  //   console.error("Failed to parse AI review as JSON:", aiReview);
  //   // Optionally, post a fallback comment or skip
  //   return;
  // }

  // console.log(reviewComments, "reviewComments")

  // for (const review of reviewComments) {
  //   await postGitHubComment(commentsUrl, review, token);
  // }
}