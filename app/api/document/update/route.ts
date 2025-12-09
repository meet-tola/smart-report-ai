/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { generateThumbnail } from "@/lib/generate-thumbnails";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, content } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const updated = await prisma.document.update({
      where: { 
        id: documentId,
      },
      data: { content },
    });

    let thumbnailUrl: string | null = updated.thumbnail;
    try {
      const newThumbnailUrl = await generateThumbnail(content, documentId);
      if (newThumbnailUrl !== updated.thumbnail) {
        // Update document with new thumbnail if different
        const thumbnailUpdated = await prisma.document.update({
          where: { 
            id: documentId,
            userId: supabaseUser.id,
          },
          data: { thumbnail: newThumbnailUrl },
        });
        thumbnailUrl = thumbnailUpdated.thumbnail;
      }
    } catch (thumbnailError: any) {
      console.error(`Failed to generate thumbnail for ${documentId}:`, thumbnailError);
    }
    return NextResponse.json({ document: { ...updated, thumbnail: thumbnailUrl } }, { status: 200 });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: "Document not found or unauthorized" }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}