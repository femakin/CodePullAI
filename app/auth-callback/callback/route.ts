import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { DynamoDBService } from "@/lib/dynamodb";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    console.log(code, "code  ccc")
    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        // console.log(error, "error error error")
        // console.log(data, "data data data")

        if (!error) {
            // Add new user to database
            const { data: userData, error: userError } = await supabase.auth.getUser()

            // console.log(userData, "userData")

            // console.log(userError, "userError")

            if (userError) {
                console.log("Error fetching user data", userError?.message)
                return NextResponse.redirect(new URL('/error', request.url))
            }

            try {
                // Check if user already exists first
                if (userData.user.email) {
                    const existingUser = await DynamoDBService.findUserByEmail(userData.user.email);

                    if (!existingUser) {
                        // Create user
                        const user = await DynamoDBService.createUser({
                            authId: userData.user.id,
                            email: userData.user.email,
                            name: userData.user.user_metadata.name,
                            imageUrl: userData.user.user_metadata.avatar_url,
                        });
                        console.log(`User created in database: ${user.id}`);
                    }
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