"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { Provider } from "@supabase/supabase-js";

export async function getUserSession() {
    try {
        const supabase = await createClient();
        if (!supabase) {
            console.error('Failed to create Supabase client');
            return null;
        }
        const { error, data } = await supabase.auth.getUser();
        if (error) {
            console.error('Error getting user session:', error);
            return null;
        }
        return { status: "success", user: data?.user };
    } catch (error) {
        console.error('Unexpected error in getUserSession:', error);
        return null;
    }
}

export async function signOut() {
    try {
        const supabase = await createClient();
        if (!supabase) {
            console.error('Failed to create Supabase client');
            redirect('/error');
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            redirect('/error');
        }

        revalidatePath('/', 'layout');
        redirect('/login');
    } catch (error) {
        console.error('Unexpected error in signOut:', error);
        redirect('/error');
    }
}

export async function signInWithOAuth(type: string) {
    try {
        const supabase = await createClient();
        if (!supabase) {
            console.error('Failed to create Supabase client');
            redirect('/error');
        }

        if (!process.env.NEXT_PUBLIC_APP_URL) {
            console.error('NEXT_PUBLIC_APP_URL is not defined');
            redirect('/error');
        }

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: type as Provider,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth-callback/callback`,
            },
        });

        if (error) {
            console.error('Error signing in with OAuth:', error);
            redirect('/error');
        }

        if (!data?.url) {
            console.error('No redirect URL received from OAuth provider');
            redirect('/error');
        }

        return redirect(data.url);
    } catch (error) {
        console.error('Unexpected error in signInWithOAuth:', error);
        redirect('/error');
    }
}

