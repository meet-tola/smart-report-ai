import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

      const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user || !data.session) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 400 }
    );
  }
  
  const user = data.user;

  await prisma.user.upsert({
    where: { authId: user.id },
    update: {},
    create: {
      authId: user.id,
      email: user.email!,
      provider: "email"
    }
  });

  return NextResponse.json({ success: true });
}
