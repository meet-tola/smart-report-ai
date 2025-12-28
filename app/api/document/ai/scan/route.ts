/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

interface ScanRequestBody {
  content: string;
  documentId: string;
}

interface ScanResponse {
  foundFields: {
    name?: string | null;
    project?: string | null;
    title?: string | null;
    school?: string | null;
  };
  placeholders: Array<{
    type: 'name' | 'project' | 'title' | 'school';
    position: number; 
    currentValue?: string;
    suggestion?: string;
  }>;
  suggestedReplaces: Array<{
    original: string;
    replacement: string;
    reason: string;
    confidence: number; // 0-1
  }>;
  needsUpdate: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { content, documentId } = await request.json() as ScanRequestBody;

    // Build detailed prompt (similar style to your second code)
    const prompt = `
You are a smart document assistant for school projects, reports, and academic documents.
Scan the following HTML document content for placeholders or existing values related to:
- Student/Name (e.g., "[Name]", "John Doe", or empty fields like "Student Name: _____")
- Project (e.g., "[Project Title]", "My Project", or sections like "Project Overview")
- Title (e.g., document title, "[Title]")
- School/Institution (e.g., "[School]", "University of Example")

Respond with ONLY the raw JSON object. Do NOT include markdown code blocks, explanations, or any other text. Start directly with { and end with }.

Output in this exact structure:
{
  "foundFields": {
    "name": "extracted name or null",
    "project": "extracted project or null",
    "title": "extracted title or null",
    "school": "extracted school or null"
  },
  "placeholders": [
    {
      "type": "name|project|title|school",
      "position": approximate character index in the content,
      "currentValue": "current text if exists",
      "suggestion": "a helpful suggestion if placeholder"
    }
  ],
  "suggestedReplaces": [
    {
      "original": "text to replace",
      "replacement": "suggested new text",
      "reason": "brief reason",
      "confidence": 0.85
    }
  ],
  "needsUpdate": true/false (if any placeholders or outdated fields found)
}

Document content:
${content}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a precise document scanner that always outputs valid JSON exactly as instructed, without any extra text or formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 4096,
      top_p: 0.95,
      stream: false,
      response_format: { type: "json_object" }, // Enforces JSON output mode
    });

    const rawContent = completion.choices[0]?.message?.content?.trim() || "{}";

    // Robust parsing (mirroring your second code's error handling)
    let parsedContent: ScanResponse;
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

    return NextResponse.json(parsedContent);
  } catch (error: any) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Failed to scan document", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}