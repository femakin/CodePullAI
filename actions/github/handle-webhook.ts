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

// Helper: Call OpenAI GPT-4 for code review
export async function getAIReview(files: any[], prTitle: string) {

  const prompt = `
  You are an expert code reviewer. Analyze the following code changes from a pull request titled "${prTitle}".

Provide specific, actionable feedback focusing on:
1. Potential bugs or errors
2. Security vulnerabilities
3. Performance improvements
4. Code style and best practices
5. Maintainability concerns

Code changes:
${files.map(f => `File: ${f.filename}\n` + f.changes.map((c: {type: string, content: string}) => `${c.type === "added" ? "+" : "-"} ${c.content}`).join("\n")).join("\n\n")}

Return ONLY a JSON array of object with a 'file', 'line', 'comment', and 'severity' fields containing an array of strings
- file: filename
- line: line content
- comment: your review comment
- severity: "low", "medium", or "high"
`
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY!}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert code reviewer." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500
    })
  });
  const data = await response.json();

  let result = [];

  try{
  const responseData = data.choices?.[0]?.message?.content

  const jsonMatch = responseData.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

  if (jsonMatch && jsonMatch[1]) {
    result = JSON.parse(jsonMatch[1]) || [];
  } else {
    result = JSON.parse(responseData) || [];
  }
  return result;
}
 catch (error) {
  return console.log("Failed to parse topics:", error);
}
  
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

  console.log(prTitle, "prTitle")

  const aiReview = await getAIReview(files, prTitle);


  console.log(aiReview, "ai Review  ")

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