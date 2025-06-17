"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { Provider } from "@supabase/supabase-js";

export async function getUserSession() {
    const supabase = await createClient();
    const { error, data } = await supabase?.auth?.getUser()
    if (error) return null
    return { status: "success", user: data?.user }
}

export async function signOut() {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut()

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function signInWithOAuth(type: string) {
    const supabase = await createClient();

    const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider: type as Provider,
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth-callback/callback`,
        },
    })

    if (error) {
        redirect("/error")
    }
    else if (data?.url) {
        return redirect(data.url)
    }
}

