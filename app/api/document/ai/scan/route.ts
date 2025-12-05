/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
    position: number; // Approximate character index in content
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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `
You are a smart document assistant for school projects, reports, and academic documents.
Scan the following HTML document content for placeholders or existing values related to:
- Student/Name (e.g., "[Name]", "John Doe", or empty fields like "Student Name: _____")
- Project (e.g., "[Project Title]", "My Project", or sections like "Project Overview")
- Title (e.g., document title, "[Title]")
- School/Institution (e.g., "[School]", "University of Example")

IMPORTANT: Respond with ONLY the raw JSON object. Do NOT include markdown code blocks like \`\`\`json or any other formatting. Start directly with { and end with }.

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

    const result = await model.generateContent(prompt);
    let responseText = await result.response.text();

    // Clean up any markdown code fences (e.g., ```json ... ```)
    responseText = responseText
      .replace(/```(?:json)?\s*?\n?/g, '') // Remove opening fence
      .replace(/\s*?```\s*$/g, '') // Remove closing fence
      .trim();

    // Parse the JSON response
    let scanResult: ScanResponse;
    try {
      scanResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw response:', responseText);
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 });
    }

    // Optionally save scan results to DB for the document
    // await fetch('/api/document/update-scan', {
    //   method: 'POST',
    //   body: JSON.stringify({ documentId, scan: scanResult }),
    // });

    return NextResponse.json(scanResult);
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Failed to scan document' }, { status: 500 });
  }
}