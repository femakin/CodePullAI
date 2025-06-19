import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server'
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const supabase = await createClient()

  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  // Store installationId in your DB, associated with the user

  try {

    const { data: userData, error: userError } = await supabase.auth.getUser()


    if (userError) {
        console.log("Error fetching user data", userError?.message)
        return NextResponse.redirect(new URL('/error', request.url))
    }
    // Check if user already exists first
    const existingUser = await prisma.users.findUnique({
        where: { email: userData.user.email },
    });
    if(existingUser){
        await prisma.users.update({
            where: { id: existingUser.id },
            data: { installationId },
        });
        console.log(`User updated in database: ${existingUser.id}`);
    }
    else if (!existingUser && userData.user.email) {
        // Create user
        const user = await prisma.users.create({
            data: {
                authId: userData.user.id,
                email: userData.user.email,
                name: userData.user.user_metadata.name,
                imageUrl: userData.user.user_metadata.avatar_url,
                installationId,
            },
        });
        console.log(`User created in database: ${user.id}`);
    }
}
catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.redirect(new URL('/error', request.url))
}

  // Redirect to dashboard or show success
  return NextResponse.redirect("/dashboard");
}