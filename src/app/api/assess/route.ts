import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const prompt = `
    As a mental health professional, analyze the following assessment data and provide comprehensive insights:
    
    Emotional State:
    - Mood: ${data.emotional.mood}
    - Emotional Intensity: ${data.emotional.intensity}/10
    - Anxiety Present: ${data.emotional.anxiety}
    
    Cognitive State:
    - Concentration Level: ${data.cognitive.concentration}/10
    - Memory Issues: ${data.cognitive.memoryIssues}
    - Thought Patterns: ${data.cognitive.thoughtPatterns}
    
    Behavioral State:
    - Sleep Quality: ${data.behavioral.sleep}
    - Social Activity: ${data.behavioral.socialActivity}
    - Daily Activities: ${data.behavioral.activities.join(', ')}

    Please provide a detailed response including:
    1. Initial assessment summary
    2. Severity level (mild/moderate/severe)
    3. Detailed action plan with:
       - Immediate steps to take
       - Daily practices to implement
       - Lifestyle modifications
       - Relaxation techniques
       - Social support suggestions
    4. Self-care recommendations:
       - Mind-body practices
       - Exercise suggestions
       - Sleep hygiene tips
       - Stress management techniques
    5. Professional support recommendations if needed
    6. Resources and support groups
    
    Format the response as JSON with these keys: 
    {
      assessment: string,
      severity: string,
      actionPlan: string[],
      selfCareRecommendations: {
        mindBody: string[],
        exercise: string[],
        sleep: string[],
        stress: string[]
      },
      professionalHelp: {
        recommended: boolean,
        urgency: string,
        type: string[]
      },
      resources: string[]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are a mental health assessment expert who provides detailed, actionable recommendations for mental well-being."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    );
  }
}