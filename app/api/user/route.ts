import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const dbUser = await prisma.users.findUnique({
      where: { authId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }
    
    // Manually convert the BigInt 'id' field to a string before sending
    const userForJson = {
      ...dbUser,
      id: dbUser.id.toString(),
    };

    return NextResponse.json({ data: userForJson }, { status: 200 })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

