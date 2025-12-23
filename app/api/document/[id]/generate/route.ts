/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

// Initialize Groq client with API key from environment
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params;

  if (!documentId) {
    return NextResponse.json(
      { error: "Missing document ID in URL" },
      { status: 400 }
    );
  }

  try {
    // Fetch pending document
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.status !== "pending") {
      return NextResponse.json(
        { error: "Invalid document or wrong status" },
        { status: 400 }
      );
    }

    // Update status to generating
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "generating" },
    });

    // Build detailed prompt
    const prompt = `
You are an expert academic writer helping a student create a high-quality ${doc.docType}.

Topic/Description: "${doc.aiPrompt}"

Generate a complete, well-structured document in clean, valid HTML (with inline styles only). Follow this structure:

- Title page with centered main title and subtitle (e.g., "Student Project Report")
- Author and date placeholders
- Table of Contents (only if more than 5 sections)
- Introduction (200–300 words)
- 3–5 main sections with clear <h2> and <h3> headings
- Use bullet points, numbered lists, and at least one <table> if relevant
- Conclusion summarizing key points and insights
- References section in APA or MLA style (include 8–12 realistic citations)

Formatting requirements:
- Use semantic HTML tags (<section>, <article>, <header>, <ul>, <ol>, <table>, etc.)
- Inline styles only (no classes or external CSS)
- Font: Arial or sans-serif, 1.5 line spacing, readable on mobile and printable
- Total length: approximately 1500–2500 words

Output ONLY the complete HTML code. Do not include explanations, markdown, or code blocks.
    `;

    // Use the best Groq model for long-form reasoning and academic writing
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Best current model for structured, high-quality output
      messages: [
        {
          role: "system",
          content:
            "You are a professional academic document generator. Produce clean, valid HTML with excellent structure and academic tone.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 8192, // Allows very long outputs (~6000–8000 words possible)
      top_p: 0.95,
      stream: false, // Set to true if you want streaming later
    });

    const html =
      completion.choices[0]?.message?.content?.trim() ||
      "<p>Generation failed: No content returned.</p>";

    // Save generated HTML and mark as ready
    await prisma.document.update({
      where: { id: documentId },
      data: {
        content: html,
        status: "ready",
      },
    });

    return NextResponse.json({ html }, { status: 200 });
  } catch (error: any) {
    console.error("Groq Generation Error:", error);

    // Revert status on failure
    try {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "error" },
      });
    } catch (updateError) {
      console.error("Failed to update status to error:", updateError);
    }

    return NextResponse.json(
      {
        error: "Failed to generate document",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}