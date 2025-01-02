import { NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    const transcription = await openai.audio.transcriptions.create({
      file: new File([buffer], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
      language: 'en'
    });

    return NextResponse.json({ text: transcription.text });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}