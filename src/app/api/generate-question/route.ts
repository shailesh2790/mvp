import { NextResponse } from 'next/server';

// Initial screening questions based on conditions
const screeningQuestions = {
  depression: [
    {
      id: 'dep_1',
      text: 'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?',
      type: 'scale',
      category: 'emotional',
      subCategory: 'depression',
      followUp: true,
      criteria: 'mood'
    },
    {
      id: 'dep_2',
      text: 'Have you experienced a significant decrease in interest or pleasure in activities you usually enjoy?',
      type: 'yesNo',
      category: 'emotional',
      subCategory: 'depression',
      followUp: true,
      criteria: 'anhedonia'
    }
  ],
  anxiety: [
    {
      id: 'anx_1',
      text: 'On a scale of 1-10, how would you rate your current anxiety level?',
      type: 'scale',
      category: 'emotional',
      subCategory: 'anxiety',
      followUp: true,
      criteria: 'severity'
    },
    {
      id: 'anx_2',
      text: 'Which physical symptoms of anxiety have you experienced recently?',
      type: 'multiSelect',
      options: [
        'Racing heart',
        'Sweating',
        'Trembling',
        'Difficulty breathing',
        'Chest tightness',
        'Nausea',
        'None of these'
      ],
      category: 'physical',
      subCategory: 'anxiety',
      followUp: true,
      criteria: 'physical'
    }
  ],
  adhd: [
    {
      id: 'adhd_1',
      text: 'How difficult is it for you to maintain focus on tasks that require sustained mental effort?',
      type: 'scale',
      category: 'cognitive',
      subCategory: 'adhd',
      followUp: true,
      criteria: 'attention'
    },
    {
      id: 'adhd_2',
      text: 'Select any organizational challenges you regularly face:',
      type: 'multiSelect',
      options: [
        'Frequently losing important items',
        'Difficulty organizing tasks',
        'Poor time management',
        'Often forgetting appointments',
        'Trouble completing tasks',
        'None of these'
      ],
      category: 'cognitive',
      subCategory: 'adhd',
      followUp: true,
      criteria: 'organization'
    }
  ],
  bipolar: [
    {
      id: 'bp_1',
      text: 'Have you experienced periods of unusually elevated mood or energy?',
      type: 'yesNo',
      category: 'emotional',
      subCategory: 'bipolar',
      followUp: true,
      criteria: 'mania'
    },
    {
      id: 'bp_2',
      text: 'How would you describe your typical mood pattern?',
      type: 'singleSelect',
      options: [
        'Mostly stable',
        'Frequent ups and downs',
        'Long periods of depression with occasional highs',
        'Rapid mood changes',
        'Unclear pattern'
      ],
      category: 'emotional',
      subCategory: 'bipolar',
      followUp: true,
      criteria: 'pattern'
    }
  ]
};

function analyzeInitialMood(moodDescription: string, intensity: number): string[] {
  const conditions = new Set<string>();
  
  // Check mood intensity
  if (intensity <= 4) {
    conditions.add('depression');
  }
  
  // Check mood description for keywords
  const moodText = moodDescription.toLowerCase();
  
  // Depression indicators
  if (moodText.includes('sad') || 
      moodText.includes('hopeless') || 
      moodText.includes('depressed') ||
      moodText.includes('tired') ||
      moodText.includes('empty')) {
    conditions.add('depression');
  }
  
  // Anxiety indicators
  if (moodText.includes('anxious') || 
      moodText.includes('worried') || 
      moodText.includes('nervous') ||
      moodText.includes('panic') ||
      moodText.includes('stress')) {
    conditions.add('anxiety');
  }
  
  // ADHD indicators
  if (moodText.includes('distracted') || 
      moodText.includes('unfocused') || 
      moodText.includes('scattered') ||
      moodText.includes('disorganized')) {
    conditions.add('adhd');
  }
  
  // Bipolar indicators
  if (moodText.includes('mood swings') || 
      moodText.includes('high and low') || 
      moodText.includes('up and down') ||
      moodText.includes('manic')) {
    conditions.add('bipolar');
  }
  
  return Array.from(conditions);
}

function selectInitialQuestion(conditions: string[], history: any[]): any {
  // If no specific conditions identified, start with depression screening
  if (conditions.length === 0) {
    return screeningQuestions.depression[0];
  }

  // Get the first identified condition that hasn't been recently assessed
  for (const condition of conditions) {
    const recentAssessment = history?.[history.length - 1]?.assessment;
    
    if (!recentAssessment || 
        !recentAssessment.conditions?.some((c: any) => 
          c.name.toLowerCase().includes(condition) && c.likelihood >= 70
        )) {
      return screeningQuestions[condition][0];
    }
  }

  // Default to depression screening if all conditions were recently assessed
  return screeningQuestions.depression[0];
}

export async function POST(request: Request) {
  try {
    const { initialMood, intensity, history = [] } = await request.json();

    // Validate input
    if (!initialMood || typeof intensity !== 'number') {
      return NextResponse.json({ 
        error: 'Missing required parameters'
      }, { status: 400 });
    }

    // Analyze initial mood description
    const potentialConditions = analyzeInitialMood(initialMood, intensity);
    
    // Select appropriate initial question
    const firstQuestion = selectInitialQuestion(potentialConditions, history);

    // Return the selected question
    return NextResponse.json(firstQuestion);

  } catch (error) {
    console.error('Generate question error:', error);
    
    // Return default first question on error
    return NextResponse.json(screeningQuestions.depression[0]);
  }
}