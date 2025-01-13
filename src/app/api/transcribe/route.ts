import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert audio file to text using Mistral
    const prompt = `Transcribe this audio file accurately. Return only the transcribed text.`;

    const response = await fetch('http://localhost:11435/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: prompt,
        stream: false,
        format: "text",
        options: {
          temperature: 0.2,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Transcription service failed');
    }

    const data = await response.json();
    return NextResponse.json({ text: data.response });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        error: 'Transcription failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}