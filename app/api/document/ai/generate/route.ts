import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    if (!supabaseUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData()
        const description = formData.get("description") as string
        const docType = formData.get("docType") as string || "report"
        const includeImages = formData.get("includeImages") === "true"
        const webSources = formData.get("webSources") === "enabled"
        // const files = formData.getAll("files") as File[]

        // Store pending data in DB (e.g., for later generation)
        const newDocument = await prisma.document.create({
            data: {
                title: `${docType} - Generated on ${new Date().toISOString().split('T')[0]}`,
                fileType: "html",
                content: "",
                status: "pending",
                aiPrompt: description,
                docType,
                includeImages,
                webSources: webSources,
                user: { connect: { authId: supabaseUser.id } },
            },
        })

        return NextResponse.json({
            documentId: newDocument.id
        }, { status: 200 })
    } catch (error) {
        console.error("API Error:", error)
        return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
    }
}