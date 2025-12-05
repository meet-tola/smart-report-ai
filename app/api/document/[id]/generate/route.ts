import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params;
  if (!documentId) {
    return NextResponse.json({ error: "Missing document ID in URL" }, { status: 400 });
  }

  try {
    // Fetch pending doc
    const doc = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!doc || doc.status !== 'pending') {
      return NextResponse.json({ error: "Invalid document" }, { status: 400 })
    }

    // Update to generating
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'generating' }
    })

    // Build prompt from stored data
    // let fileContext = ""
    // if (doc.files) { 
    //   fileContext = "Incorporate content from uploaded files."
    // }

    const sourceContext = doc.webSources === true ? "Include references to web sources where relevant." : ""
    const imagePrompt = doc.includeImages ? "Include placeholders for relevant images (e.g., <img src='placeholder.jpg' alt='Description' class='project-image'>) with descriptive alt text." : ""

    const prompt = `
Generate a complete ${doc.docType} document based on this description: "${doc.aiPrompt}".
${sourceContext}
${imagePrompt}

Structure for a student project/report:
- Title page: Centered title, subtitle (e.g., "Student Project Report"), author/date placeholders.
- Table of Contents (if >5 sections).
- Introduction: 200-300 words overview.
- Main sections: 3-5 logical sections with H2/H3 headings, bullet points, numbered lists, and a table if data-heavy.
- Conclusion: Summary and recommendations.
- References: APA/MLA style list.
- Use clean, academic layout: Sans-serif font (e.g., Arial), 1.5 line spacing, margins.

Output ONLY valid HTML with inline styles (no external CSS). Use semantic tags: <h1> for title, <section>, <ul>/<ol>, <table>. Make it printable and mobile-friendly. Keep total length 1000-2000 words.
    `
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent(prompt)
    const html = result.response.text() || "<p>Generation failed.</p>"

    // Update DB with content and status
    await prisma.document.update({
      where: { id: documentId },
      data: {
        content: html,
        status: 'ready'
      }
    })

    return NextResponse.json({ html }, { status: 200 })
  } catch (error) {
    console.error("Generation Error:", error)
    // Revert status if failed
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'error' }
    })
    return NextResponse.json({ error: "Failed to generate document" }, { status: 500 })
  }
}