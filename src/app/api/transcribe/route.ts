// app/api/transcribe/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get('audio') as Blob;

    if (!audioBlob) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert blob to base64
    const buffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');

    // Use Mistral to transcribe (since OpenAI Whisper might not be available)
    const response = await fetch('http://localhost:11435/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: `Transcribe the following audio content into text. Consider emotional context and mental health aspects in the transcription: ${base64Audio}`,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const result = await response.json();

    return NextResponse.json({ text: result.response });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed', details: error.message },
      { status: 500 }
    );
  }
}