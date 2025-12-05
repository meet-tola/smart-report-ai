import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return NextResponse.json({ user: null });
  }

  // Fetch your DB user using authId
  const dbUser = await prisma.user.findUnique({
    where: { authId: supabaseUser.id }
  });

  return NextResponse.json({ user: dbUser });
}
