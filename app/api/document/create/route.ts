import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string;

  let fileUrl: string | null = null;
  let fileType: string | null = null;

  if (file) {
    fileType = file.type;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to the specific folder "1pyhs8m_3"
    const filePath = `private/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("user-documents")
      .upload(filePath, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage
      .from("user-documents")
      .getPublicUrl(filePath);

    fileUrl = data.publicUrl;
  }

  const newDocument = await prisma.document.create({
    data: {
      user: { connect: { authId: supabaseUser.id } },
      title: title || "Untitled Document",
      content: "{}",
      fileUrl,
      fileType,
    },
  });

  return NextResponse.json({ document: newDocument }, { status: 201 });
}
