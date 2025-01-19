// app/api/assess/route.ts

import { NextResponse } from 'next/server';

interface AssessmentData {
  emotional: {
    mood: string;
    intensity: number;
    moodSwings: boolean;
    anxiety: boolean;
    energy: number;
    description: string;
    voiceJournal: string;
  };
  cognitive: {
    concentration: number;
    focusIssues: boolean;
    memoryIssues: boolean;
    thoughtPatterns: string;
    decisionMaking: number;
    clarity: number;
  };
  behavioral: {
    sleep: 'good' | 'fair' | 'poor';
    sleepHours: number;
    socialActivity: 'normal' | 'reduced' | 'withdrawn' | 'increased';
    activities: string[];
    avoidance: boolean;
    routineChanges: boolean;
  };
}

function calculateClinicalScores(responses: any[]) {
  const scores = {
    depression: 0,
    anxiety: 0,
    stress: 0,
    adjustment: 0
  };

  responses.forEach(response => {
    const question = response.question;
    if (question.clinicalRelevance) {
      question.clinicalRelevance.forEach((condition: string) => {
        if (question.type === 'scale') {
          scores[condition] += 11 - response.response; // Invert scale for severity
        } else if (question.type === 'yesNo' && response.response) {
          scores[condition] += 5;
        } else if (question.type === 'multiSelect') {
          scores[condition] += response.response.length * 2;
        }
      });
    }
  });

  // Normalize scores to 0-10 range
  Object.keys(scores).forEach(key => {
    scores[key] = Math.min(Math.round((scores[key] / 50) * 10), 10);
  });

  return scores;
}

function generateClinicalSummary(responses: any[], scores: any) {
  const clinicalScores = calculateClinicalScores(responses);
  
  const findings = {
    primaryConcerns: [] as string[],
    clinicalImpressions: [] as string[],
    icdCodes: [] as any[],
    nimhansScales: [] as string[],
    severity: '',
    riskLevel: 'low',
    recommendations: [] as string[]
  };

  // Determine primary concerns and clinical impressions
  Object.entries(clinicalScores).forEach(([condition, score]) => {
    if (score >= 7) {
      findings.primaryConcerns.push(condition);
      findings.icdCodes.push({
        condition,
        icd10: condition === 'depression' ? 'F32' : condition === 'anxiety' ? 'F41' : 'F43',
        icd11: condition === 'depression' ? '6A70' : condition === 'anxiety' ? '6B00' : '6B40'
      });
    }
  });

  // Set severity based on highest score
  const maxScore = Math.max(...Object.values(clinicalScores));
  findings.severity = maxScore >= 8 ? 'severe' : maxScore >= 6 ? 'moderate' : 'mild';
  
  // Determine risk level
  findings.riskLevel = maxScore >= 8 ? 'high' : maxScore >= 6 ? 'moderate' : 'low';

  // Generate NIMHANS scale recommendations
  findings.nimhansScales = findings.primaryConcerns.map(concern => {
    switch(concern) {
      case 'depression': return 'Hamilton Depression Rating Scale (HAM-D)';
      case 'anxiety': return 'Hamilton Anxiety Rating Scale (HAM-A)';
      case 'stress': return 'Perceived Stress Scale (PSS)';
      default: return '';
    }
  }).filter(scale => scale !== '');

  // Generate clinical impressions
  findings.clinicalImpressions = findings.primaryConcerns.map(concern => {
    const score = clinicalScores[concern];
    return `${concern.charAt(0).toUpperCase() + concern.slice(1)}: ${score}/10 - ${findings.severity} severity`;
  });

  // Generate recommendations
  if (findings.severity === 'severe') {
    findings.recommendations.push('Immediate professional mental health consultation recommended');
    findings.recommendations.push('Consider comprehensive psychiatric evaluation');
  } else if (findings.severity === 'moderate') {
    findings.recommendations.push('Professional mental health consultation recommended');
    findings.recommendations.push('Regular monitoring of symptoms advised');
  }

  findings.recommendations.push(...findings.nimhansScales.map(scale => 
    `Complete ${scale} for detailed assessment`
  ));

  return findings;
}

function calculateScores(assessment: AssessmentData, responses: any[]) {
  const scores = {
    emotional: 0,
    cognitive: 0,
    behavioral: 0,
    overall: 0
  };

  // Calculate scores from assessment data
  scores.emotional = (
    assessment.emotional.intensity +
    (!assessment.emotional.anxiety ? 10 : 5) +
    (!assessment.emotional.moodSwings ? 10 : 5) +
    assessment.emotional.energy
  ) / 4;

  scores.cognitive = (
    assessment.cognitive.concentration +
    (!assessment.cognitive.focusIssues ? 10 : 5) +
    (!assessment.cognitive.memoryIssues ? 10 : 5) +
    assessment.cognitive.decisionMaking +
    assessment.cognitive.clarity
  ) / 5;

  scores.behavioral = (
    (assessment.behavioral.sleep === 'good' ? 10 : assessment.behavioral.sleep === 'fair' ? 7 : 4) +
    (assessment.behavioral.sleepHours >= 7 ? 10 : assessment.behavioral.sleepHours >= 6 ? 7 : 4) +
    (assessment.behavioral.socialActivity === 'normal' ? 10 : 
      assessment.behavioral.socialActivity === 'reduced' ? 7 : 
      assessment.behavioral.socialActivity === 'withdrawn' ? 4 : 6) +
     (!assessment.behavioral.avoidance ? 10 : 5) +
     (!assessment.behavioral.routineChanges ? 10 : 5)
   ) / 5;
 
   scores.overall = (scores.emotional + scores.cognitive + scores.behavioral) / 3;
 
   return scores;
 }
 
 function generateDetailedAnalysis(assessment: AssessmentData, scores: any, clinicalSummary: any) {
   return {
     emotional: {
       summary: `Your emotional well-being score is ${scores.emotional.toFixed(1)}/10. ${
         scores.emotional < 5 ? 
           "You appear to be experiencing significant emotional challenges." :
         scores.emotional < 7 ?
           "You're showing moderate emotional stability with some areas for improvement." :
           "You're displaying good emotional stability overall."
       }`,
       details: [
         `Mood and energy levels: ${assessment.emotional.intensity}/10`,
         assessment.emotional.anxiety ? "Presence of anxiety symptoms noted" : "",
         assessment.emotional.moodSwings ? "Mood fluctuations reported" : "",
         `Energy level reported at ${assessment.emotional.energy}/10`
       ].filter(Boolean),
       recommendations: [
         "Practice daily mindfulness meditation",
         "Maintain a mood journal",
         assessment.emotional.anxiety ? "Consider anxiety-reduction techniques" : "",
         assessment.emotional.moodSwings ? "Establish consistent daily routines" : "",
         "Engage in regular physical activity",
         scores.emotional < 6 ? "Consider professional mental health support" : ""
       ].filter(Boolean)
     },
     cognitive: {
       summary: `Your cognitive functioning score is ${scores.cognitive.toFixed(1)}/10. ${
         scores.cognitive < 5 ?
           "You're experiencing significant cognitive challenges." :
         scores.cognitive < 7 ?
           "Your cognitive function shows moderate efficiency with some areas for improvement." :
           "You're demonstrating good cognitive function overall."
       }`,
       details: [
         `Concentration level: ${assessment.cognitive.concentration}/10`,
         assessment.cognitive.focusIssues ? "Difficulties with focus and attention noted" : "",
         assessment.cognitive.memoryIssues ? "Memory challenges reported" : "",
         `Decision-making capacity: ${assessment.cognitive.decisionMaking}/10`
       ].filter(Boolean),
       recommendations: [
         "Practice cognitive exercises regularly",
         assessment.cognitive.focusIssues ? "Break tasks into smaller chunks" : "",
         assessment.cognitive.memoryIssues ? "Use memory aids and organization tools" : "",
         "Ensure adequate sleep",
         "Consider mindfulness practices",
         scores.cognitive < 6 ? "Consult with a healthcare provider" : ""
       ].filter(Boolean)
     },
     behavioral: {
       summary: `Your behavioral health score is ${scores.behavioral.toFixed(1)}/10. ${
         scores.behavioral < 5 ?
           "Several behavioral patterns may be impacting your well-being." :
         scores.behavioral < 7 ?
           "Your behavioral patterns show moderate health with some areas for improvement." :
           "You're maintaining generally healthy behavioral patterns."
       }`,
       details: [
         `Sleep Quality: ${assessment.behavioral.sleep} (${assessment.behavioral.sleepHours} hours)`,
         `Social Activity Level: ${assessment.behavioral.socialActivity}`,
         assessment.behavioral.avoidance ? "Avoidance behaviors noted" : "",
         assessment.behavioral.routineChanges ? "Changes in daily routines reported" : ""
       ].filter(Boolean),
       recommendations: [
         assessment.behavioral.sleepHours < 7 ? "Work on improving sleep duration and quality" : "",
         assessment.behavioral.socialActivity === 'reduced' || assessment.behavioral.socialActivity === 'withdrawn' ?
           "Gradually increase social interactions" : "",
         assessment.behavioral.avoidance ? "Practice gradual exposure to avoided situations" : "",
         assessment.behavioral.routineChanges ? "Establish consistent daily routines" : "",
         "Maintain regular exercise",
         "Practice good sleep hygiene"
       ].filter(Boolean)
     }
   };
 }
 
 export async function POST(request: Request) {
   try {
     const body = await request.json();
     const { currentAssessment, responses, history } = body;
 
     if (!currentAssessment) {
       return NextResponse.json(
         { error: 'Assessment data is required' },
         { status: 400 }
       );
     }
 
     // Calculate basic scores
     const scores = calculateScores(currentAssessment, responses);
 
     // Generate clinical summary
     const clinicalSummary = generateClinicalSummary(responses, scores);
 
     // Generate detailed analysis
     const detailedAnalysis = generateDetailedAnalysis(currentAssessment, scores, clinicalSummary);
 
     // Prepare final assessment
     const assessment = {
       timestamp: new Date().toISOString(),
       scores,
       summary: `Overall Assessment Score: ${scores.overall.toFixed(1)}/10`,
       clinicalSummary,
       detailedAnalysis,
       recommendations: {
         immediate: clinicalSummary.severity === 'severe' ? [
           "Seek immediate professional mental health support",
           "Consider comprehensive psychiatric evaluation",
           "Establish a safety plan with support network"
         ] : [],
         shortTerm: [
           ...clinicalSummary.recommendations,
           "Regular monitoring of symptoms",
           "Implement suggested coping strategies"
         ],
         longTerm: [
           "Develop sustainable self-care routines",
           "Build strong support networks",
           "Regular mental health check-ins"
         ]
       }
     };
 
     return NextResponse.json({
       success: true,
       assessment
     });
 
   } catch (error) {
     console.error('Assessment error:', error);
     return NextResponse.json(
       { error: 'Assessment failed', details: error instanceof Error ? error.message : 'Unknown error' },
       { status: 500 }
     );
   }
 }
