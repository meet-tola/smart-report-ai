import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const prismaUser = await prisma.user.findUnique({
      where: {
        authId: supabaseUser.id,  
      },
    });

    const documents = await prisma.document.findMany({
      where: {
        userId: prismaUser.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        fileType: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const recentDocument = documents.length > 0 ? documents[0] : null;

    return NextResponse.json({ documents, recentDocument });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}