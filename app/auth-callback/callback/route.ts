import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { prisma } from "@/lib/prisma";
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)

    console.log(origin, "origin")


    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)
        console.log(data, "data")

        if (!error) {

            //add new user to database
            const { data, error: userError } = await supabase.auth.getUser()

            if (userError) {
                console.log("Error fetching user data", userError?.message)
                return NextResponse.redirect(`${origin}/error`)
            }

            try {
                // Check if user already exists first
                const existingUser = await prisma.users.findUnique({
                    where: { email: data.user.email },
                });

                if (!existingUser && data.user.email) {
                    // Create user
                    const user = await prisma.users.create({
                        data: {
                            authId: data.user.id,
                            email: data.user.email,
                            name: data.user.user_metadata.name,
                            imageUrl: data.user.user_metadata.avatar_url,
                        },
                    });
                    console.log(`User created in database: ${user.id}`);
                }
            }
            catch (error) {
                console.error("Error creating user and subscription:", error);
                redirect("/error")
            }
            //add new user to database

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}