import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Add new user to database
            const { data: userData, error: userError } = await supabase.auth.getUser()

            if (userError) {
                console.log("Error fetching user data", userError?.message)
                return NextResponse.redirect(new URL('/error', request.url))
            }

            try {
                // Check if user already exists first
                const existingUser = await prisma.users.findUnique({
                    where: { email: userData.user.email },
                });

                if (!existingUser && userData.user.email) {
                    // Create user
                    const user = await prisma.users.create({
                        data: {
                            authId: userData.user.id,
                            email: userData.user.email,
                            name: userData.user.user_metadata.name,
                            imageUrl: userData.user.user_metadata.avatar_url,
                        },
                    });
                    console.log(`User created in database: ${user.id}`);
                }
            }
            catch (error) {
                console.error("Error creating user:", error);
                return NextResponse.redirect(new URL('/error', request.url))
            }

            // Redirect to the dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(new URL('/error', request.url))
}