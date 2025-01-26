import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.ASSEMBLY_AI_KEY) {
  throw new Error('Missing environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get('audio') as Blob;

    if (!audioBlob) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Upload to Supabase
    const buffer = await audioBlob.arrayBuffer();
    const fileName = `voice-journal-${Date.now()}.webm`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('voice-journals')
      .upload(fileName, buffer);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('voice-journals')
      .getPublicUrl(fileName);

    // AssemblyAI transcription
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ASSEMBLY_AI_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: publicUrl,
        language_code: 'en',
        sentiment_analysis: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      id: result.id,
      text: result.text,
      sentiment: result.sentiment_analysis_results
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}