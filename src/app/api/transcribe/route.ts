import { NextResponse } from 'next/server';

async function transcribeAudio(audioBuffer: Buffer) {
  const OLLAMA_PORT = process.env.OLLAMA_PORT || '11435';

  try {
    // Convert audio buffer to base64
    const base64Audio = audioBuffer.toString('base64');

    const response = await fetch(`http://localhost:${OLLAMA_PORT}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "whisper",
        prompt: "Transcribe this audio",
        audio: base64Audio,
        format: "text"
      }),
    });

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw error;
  }
}

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

    // Convert audio file to buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Get transcription
    const transcription = await transcribeAudio(buffer);

    return NextResponse.json({ text: transcription });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Handle connection errors
    if (error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Service unavailable',
          details: 'Unable to connect to the transcription service. Please ensure Ollama is running.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Transcription failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}