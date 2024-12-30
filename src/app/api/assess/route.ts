import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const prompt = `
    As a clinical psychologist, provide a comprehensive mental health assessment based on the following data, using DSM-5 criteria and evidence-based assessment tools:

    Patient Data:
    Emotional State:
    - Mood Description: ${data.emotional.mood}
    - Emotional Intensity: ${data.emotional.intensity}/10
    - Anxiety Present: ${data.emotional.anxiety}
    - Mood Swings: ${data.emotional.moodSwings}
    
    Cognitive State:
    - Concentration Level: ${data.cognitive.concentration}/10
    - Memory Issues: ${data.cognitive.memoryIssues}
    - Thought Patterns: ${data.cognitive.thoughtPatterns}
    
    Behavioral Patterns:
    - Sleep Quality: ${data.behavioral.sleep}
    - Social Activity: ${data.behavioral.socialActivity}
    - Daily Activities: ${data.behavioral.activities.join(', ')}

    Please provide a detailed clinical assessment including:

    1. Clinical Assessment:
       - Primary symptoms analysis based on DSM-5 criteria
       - Potential diagnostic considerations for depression, anxiety, and bipolar disorder
       - Severity assessment using standardized metrics
       - Risk assessment

    2. Diagnostic Considerations:
       - Depression indicators (PHQ-9 based)
       - Anxiety assessment (GAD-7 based)
       - Bipolar disorder screening (MDQ based)
       - Other potential concerns

    3. Treatment Recommendations:
       - Evidence-based therapeutic approaches
       - Psychotherapy recommendations
       - Lifestyle modifications
       - Support system engagement
       - Crisis resources if needed

    4. Clinical Action Plan:
       - Immediate interventions needed
       - Short-term treatment goals
       - Long-term management strategies
       - Monitoring recommendations

    5. Professional Support Framework:
       - Type of mental health professionals needed
       - Frequency of recommended sessions
       - Additional assessments needed
       - Interdisciplinary care considerations

    6. Support Resources:
       - Clinical support services
       - Crisis intervention resources
       - Support groups
       - Educational materials
       - Family support recommendations

    Format the response as JSON with these keys:
    {
      clinicalAssessment: {
        primarySymptoms: string[],
        diagnosticConsiderations: string[],
        severityLevel: string,
        riskLevel: string
      },
      diagnosticIndications: {
        depression: {
          score: number,
          severity: string,
          keySymptoms: string[]
        },
        anxiety: {
          score: number,
          severity: string,
          keySymptoms: string[]
        },
        bipolar: {
          indicated: boolean,
          warningSigns: string[]
        }
      },
      treatmentPlan: {
        immediate: string[],
        shortTerm: string[],
        longTerm: string[],
        therapyApproaches: string[]
      },
      professionalCare: {
        recommendedProviders: string[],
        sessionFrequency: string,
        additionalAssessments: string[],
        urgencyLevel: string
      },
      supportResources: {
        clinical: string[],
        crisis: string[],
        support: string[],
        educational: string[]
      },
      followUpCare: {
        timeline: string,
        monitoringPlan: string,
        warningSignsToWatch: string[]
      }
    }
    
    Base all assessments on DSM-5 criteria, clinical best practices, and evidence-based treatment guidelines.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { 
          role: "system", 
          content: "You are a clinical psychologist with expertise in DSM-5 diagnostics and evidence-based mental health assessments. Provide comprehensive clinical evaluations and treatment recommendations based on established psychological assessment tools and clinical best practices."
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
      { error: 'Failed to process clinical assessment' },
      { status: 500 }
    );
  }
}