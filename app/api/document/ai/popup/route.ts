/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface AIAssistRequestBody {
  message: string;
  context: string; // Selected text
  action?: 'rewrite' | 'summarize' | 'explain' | 'expand'; // Optional intent
}

interface AIAssistResponse {
  response: string; // Natural language explanation/advice
  suggestedAction?: {
    type: 'replace' | 'insert';
    content: string; // New text to apply
    reason: string; // Why this suggestion
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, action = 'general' } = await request.json() as AIAssistRequestBody;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    let intent = action === 'general' ? 'provide advice or rewrite' : action;
    const prompt = `
You are an AI writing assistant for academic documents. The user has selected text: "${context}"
User query: "${message}"

Based on the query, respond helpfully (e.g., explain, suggest improvements). Always suggest an actionable edit if relevant.

Output format:
1. Natural response (1-3 sentences, concise).
2. If an edit is suggested, end with JSON:
{
  "suggestedAction": {
    "type": "replace|insert",
    "content": "The exact new text to replace/insert",
    "reason": "Brief reason for the change"
  }
}
Keep JSON valid and self-contained. Do not suggest if query is purely informational.

Example:
Great idea! Rewriting for clarity: [JSON here]
`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    // Parse: Natural text + optional JSON
    const jsonMatch = responseText.match(/\{[\s\S]*suggestedAction[\s\S]*\}/); // Target JSON with suggestedAction
    const naturalResponse = jsonMatch ? responseText.replace(jsonMatch[0], '').trim() : responseText.trim();

    let parsedAction: any = null;
    if (jsonMatch) {
      try {
        parsedAction = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }
    }

    const aiResult: AIAssistResponse = {
      response: naturalResponse,
      ...(parsedAction?.suggestedAction && { suggestedAction: parsedAction.suggestedAction }),
    };

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error('AI Assist error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
  }
}