import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// transcribe/route.ts
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof Blob)) {
      throw new Error('Invalid audio file');
    }

    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioFile], 'audio.webm', { type: 'audio/webm' }),
      model: "whisper-1"
    });

    return NextResponse.json({
      success: true,
      text: transcription.text
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Transcription failed'
    }, { status: 200 }); // Send 200 to avoid 504
  }
}

