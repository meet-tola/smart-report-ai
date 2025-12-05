import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const fileName = file.name
    const fileType = file.type || getMimeType(fileName)

    // Only allow PDF or DOC/DOCX
    if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(fileType)) {
      return NextResponse.json({ error: "Only PDF and DOCX files are supported" }, { status: 400 })
    }

    const base64 = Buffer.from(buffer).toString("base64")

    return NextResponse.json({
      success: true,
      fileName,
      fileType,
      fileData: `data:${fileType};base64,${base64}`,
      size: buffer.byteLength,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
  }
  return mimeTypes[ext || ""] || "application/octet-stream"
}
