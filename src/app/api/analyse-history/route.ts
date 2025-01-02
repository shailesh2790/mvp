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

async function queryMistral(prompt: string) {
  const OLLAMA_PORT = process.env.OLLAMA_PORT || '11434';
  
  try {
    const response = await fetch(`http://localhost:${OLLAMA_PORT}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: prompt,
        stream: false,
        format: "json"
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Mistral API error:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { currentAssessment, history } = await request.json();

    if (!currentAssessment) {
      return NextResponse.json(
        { error: 'Current assessment data is required' },
        { status: 400 }
      );
    }

    const prompt = `As a mental health professional, analyze this user's mental health history and provide detailed recommendations.

Current Assessment Data:
${JSON.stringify(currentAssessment, null, 2)}

Historical Data:
${JSON.stringify(history || [], null, 2)}

Analyze the data and provide:
1. Identify recurring patterns in the user's mental health
2. Track progress over time
3. Create personalized recommendations based on past responses
4. List potential early warning signs
5. Suggest emotional intelligence improvements

Return your analysis as a JSON object with EXACTLY this structure:
{
  "patterns": string[],
  "progress": {
    "improvements": string[],
    "concerns": string[]
  },
  "personalizedRecommendations": string[],
  "earlyWarningSignals": string[],
  "eqDevelopment": {
    "strengths": string[],
    "areasForImprovement": string[],
    "exercises": string[]
  }
}

Ensure all arrays contain 3-5 detailed items. Be specific and professional while maintaining a supportive tone.`;

    // Query Mistral model
    const result = await queryMistral(prompt);
    
    // Parse and validate response
    const parsedResult = JSON.parse(result);
    
    // Validate and format the response
    const validatedResponse: AnalysisResponse = {
      patterns: Array.isArray(parsedResult.patterns) ? parsedResult.patterns : [],
      progress: {
        improvements: Array.isArray(parsedResult.progress?.improvements) ? parsedResult.progress.improvements : [],
        concerns: Array.isArray(parsedResult.progress?.concerns) ? parsedResult.progress.concerns : []
      },
      personalizedRecommendations: Array.isArray(parsedResult.personalizedRecommendations) ? parsedResult.personalizedRecommendations : [],
      earlyWarningSignals: Array.isArray(parsedResult.earlyWarningSignals) ? parsedResult.earlyWarningSignals : [],
      eqDevelopment: {
        strengths: Array.isArray(parsedResult.eqDevelopment?.strengths) ? parsedResult.eqDevelopment.strengths : [],
        areasForImprovement: Array.isArray(parsedResult.eqDevelopment?.areasForImprovement) ? parsedResult.eqDevelopment.areasForImprovement : [],
        exercises: Array.isArray(parsedResult.eqDevelopment?.exercises) ? parsedResult.eqDevelopment.exercises : []
      }
    };

    // Validate that we have content in our arrays
    const hasContent = Object.values(validatedResponse).every(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') {
        return Object.values(value).every(arr => 
          Array.isArray(arr) && arr.length > 0
        );
      }
      return true;
    });

    if (!hasContent) {
      throw new Error('Invalid response structure: Empty arrays detected');
    }

    return NextResponse.json(validatedResponse);

  } catch (error) {
    console.error('History analysis error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Invalid response format',
          details: 'Failed to parse analysis results'
        },
        { status: 500 }
      );
    }

    // Handle connection errors
    if (error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Service unavailable',
          details: 'Unable to connect to the analysis service. Please ensure Ollama is running.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}