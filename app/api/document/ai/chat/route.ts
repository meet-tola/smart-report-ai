/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ChatRequestBody {
  message: string;
  context?: string; // Selected text or full content snippet
  documentId: string;
  action?: 'chat' | 'replace' | 'insert'; 
}

interface ChatResponse {
  response: string;
  suggestedAction?: {
    type: 'replace' | 'insert';
    position?: number; // For editor updates
    content: string;
    reason: string;
  };
  updatedReplaces?: Array<{
    original: string;
    replacement: string;
    reason: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, documentId, action = 'chat' } = await request.json() as ChatRequestBody;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    let prompt = `
You are a helpful AI assistant for editing school projects, reports, and academic documents.
User query: ${message}

Context from document: ${context || 'No specific selection provided.'}

If the query asks to update/replace/insert content (e.g., "change project title to X"), suggest a precise action.
Otherwise, provide helpful advice.

Respond in natural language, but if an action is needed, include JSON for updates.

Output format:
First, the natural response text.
Then, if applicable, a JSON block like:
{
  "suggestedAction": {
    "type": "replace|insert",
    "position": approximate char index (if known),
    "content": "new text to insert/replace",
    "reason": "why this change"
  },
  "updatedReplaces": [ { "original": "...", "replacement": "...", "reason": "..." } ] // List of global replaces to suggest
}
`;

    if (action === 'replace' || action === 'insert') {
      prompt += `\nMode: Suggest ${action} action based on query.`;
    }

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    // Split response: natural text + optional JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const naturalResponse = jsonMatch ? responseText.replace(jsonMatch[0], '').trim() : responseText.trim();

    let parsedAction: any = null;
    if (jsonMatch) {
      try {
        parsedAction = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }
    }

    const chatResult: ChatResponse = {
      response: naturalResponse,
      ...(parsedAction?.suggestedAction && { suggestedAction: parsedAction.suggestedAction }),
      ...(parsedAction?.updatedReplaces && { updatedReplaces: parsedAction.updatedReplaces }),
    };

    // Optionally save chat history or updates to DB
    // await fetch('/api/user/chat/save', { method: 'POST', body: JSON.stringify({ documentId, message, response: chatResult }) });

    return NextResponse.json(chatResult);
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}