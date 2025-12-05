import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let next = searchParams.get("next") ?? "/home";
  if (!next.startsWith("/")) next = "/home";

  if (!code) return NextResponse.redirect(`${origin}/auth/auth-code-error`);

  const supabase = await createClient();

  // Exchange code → set secure cookies
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error(exchangeError);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Fetch authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error(userError);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Upsert user in Prisma
  await prisma.user.upsert({
    where: { authId: user.id },
    update: {
      email: user.email!,
      name: user.user_metadata.full_name ?? null,
      avatar: user.user_metadata.avatar_url ?? null,
      provider: user.app_metadata.provider ?? null
    },
    create: {
      authId: user.id,
      email: user.email!,
      name: user.user_metadata.full_name ?? null,
      avatar: user.user_metadata.avatar_url ?? null,
      provider: user.app_metadata.provider ?? null
    }
  });

  const forwarded = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";

  if (isLocal) return NextResponse.redirect(`${origin}${next}`);
  if (forwarded) return NextResponse.redirect(`https://${forwarded}${next}`);
  return NextResponse.redirect(`${origin}${next}`);
}
