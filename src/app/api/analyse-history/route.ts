import { NextResponse } from 'next/server';

interface AnalysisResponse {
 patterns: string[];
 progress: {
   improvements: string[];
   concerns: string[];
 };
 personalizedRecommendations: string[];
 earlyWarningSignals: string[];
 eqDevelopment: {
   strengths: string[];
   areasForImprovement: string[];
   exercises: string[];
 };
}

async function queryHF(prompt: string) {
 try {
   const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1', {
     headers: {
       'Authorization': `Bearer ${process.env.HF_API_KEY}`,
       'Content-Type': 'application/json'
     },
     method: 'POST',
     body: JSON.stringify({
       inputs: prompt,
       parameters: {
         temperature: 0.8,
         top_p: 0.9,
         max_new_tokens: 1000,
         return_full_text: false
       }
     })
   });

   if (!response.ok) throw new Error('HF API error');
   const data = await response.json();
   return data[0].generated_text;
 } catch (error) {
   console.error('HF API error:', error);
   throw error;
 }
}

export async function POST(request: Request) {
 try {
   const { currentAssessment, history } = await request.json();
   if (!currentAssessment) {
     return NextResponse.json({ error: 'Assessment data required' }, { status: 400 });
   }

   const timestamp = new Date().toISOString();
   const contextPrompt = `Analyze mental health assessment from ${timestamp}:
     Current: ${JSON.stringify(currentAssessment)}
     History: ${JSON.stringify(history || [])}
     
     Return JSON with exactly:
     {
       "patterns": ["5 behavioral patterns"],
       "progress": {
         "improvements": ["3-4 progress areas"],
         "concerns": ["3-4 concern areas"]
       },
       "personalizedRecommendations": ["4-5 actions"],
       "earlyWarningSignals": ["4-5 warning signs"],
       "eqDevelopment": {
         "strengths": ["3-4 strengths"],
         "areasForImprovement": ["3-4 areas"],
         "exercises": ["4-5 exercises"]
       }
     }`;

   const result = await queryHF(contextPrompt);
   let parsedResult;
   try {
     parsedResult = JSON.parse(result);
   } catch (error) {
     console.error('Failed to parse HF response:', result);
     throw new Error('Invalid response format');
   }

   // Validate and ensure all arrays exist
   const validatedResponse: AnalysisResponse = {
     patterns: Array.isArray(parsedResult?.patterns) ? parsedResult.patterns : [],
     progress: {
       improvements: Array.isArray(parsedResult?.progress?.improvements) ? parsedResult.progress.improvements : [],
       concerns: Array.isArray(parsedResult?.progress?.concerns) ? parsedResult.progress.concerns : []
     },
     personalizedRecommendations: Array.isArray(parsedResult?.personalizedRecommendations) ? parsedResult.personalizedRecommendations : [],
     earlyWarningSignals: Array.isArray(parsedResult?.earlyWarningSignals) ? parsedResult.earlyWarningSignals : [],
     eqDevelopment: {
       strengths: Array.isArray(parsedResult?.eqDevelopment?.strengths) ? parsedResult.eqDevelopment.strengths : [],
       areasForImprovement: Array.isArray(parsedResult?.eqDevelopment?.areasForImprovement) ? parsedResult.eqDevelopment.areasForImprovement : [],
       exercises: Array.isArray(parsedResult?.eqDevelopment?.exercises) ? parsedResult.eqDevelopment.exercises : []
     }
   };

   // Ensure minimum content
   if (!validatedResponse.patterns.length || !validatedResponse.personalizedRecommendations.length) {
     throw new Error('Insufficient analysis generated');
   }

   return NextResponse.json(validatedResponse);

 } catch (error) {
   console.error('Analysis error:', error);
   return NextResponse.json(
     { error: error instanceof Error ? error.message : 'Analysis failed' },
     { status: 500 }
   );
 }
}