/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";

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

    // Build detailed prompt (updated to output JSON with references)
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
- References section in APA or MLA style (include 8–12 realistic citations with actual hyperlinks using <a href="URL">Title</a>)

For the References section, use real or plausible academic sources. Include working URLs (e.g., to DOIs, Google Scholar, PDFs, or reputable sites like pubmed.gov, arxiv.org, or jstor.org). Make citations clickable in the HTML.

Output as JSON in this exact format:
{
  "html": "The complete HTML code here",
  "references": [
    {
      "title": "Full reference title",
      "authors": "Author names",
      "year": "YYYY",
      "url": "https://example.com/source"
    },
    // ... 8-12 more
  ]
}

Do not include explanations, markdown, or code blocks outside the JSON.
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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
      max_tokens: 8192,
      top_p: 0.95,
      stream: false,
    });

    const rawContent = completion.choices[0]?.message?.content?.trim() || "{}";
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
      console.log("Parsed JSON successfully");
    } catch (e) {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
          console.warn("Extracted JSON from wrapped output");
        } catch (e2) {
          throw new Error("Invalid JSON from AI even after extraction");
        }
      } else {
        throw new Error("No JSON found in AI response");
      }
    }

    const html = parsedContent.html || "<p>Generation failed: No content returned.</p>";
    const references = parsedContent.references || [];

    // Save generated HTML, references, and mark as ready
    await prisma.document.update({
      where: { id: documentId },
      data: {
        content: html,
        references: references,
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