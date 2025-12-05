import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

type SignupBody = {
  email: string;
  password: string;
  name: string;
};

export async function POST(req: Request) {
  try {
    const { email, password, name }: SignupBody = await req.json();
    const supabase = await createClient();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 } // Conflict
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const supabaseUser = data.user;

    if (!supabaseUser) {
      return NextResponse.json({
        ok: true,
        message: "Signup successfully",
      });
    }

    await prisma.user.upsert({
      where: { authId: supabaseUser.id },
      update: { email, name },
      create: {
        authId: supabaseUser.id,
        email,
        name,
        provider: "email",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
