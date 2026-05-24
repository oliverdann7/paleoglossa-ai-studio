import type { BeginnerMilestone } from '../hooks/useBeginnerProgress.js';

export interface GuidedStep {
  label: string;
  description: string;
  milestone?: BeginnerMilestone;
  action?: { label: string; to: string };
}

export interface GuidedTier {
  id: string;
  label: string;
  description: string;
  steps: GuidedStep[];
}

export const GUIDED_TIERS: GuidedTier[] = [
  {
    id: 'know-nothing',
    label: 'I know nothing',
    description: 'Start from absolute zero — learn the script and read your first sentence.',
    steps: [
      {
        label: 'Learn the script',
        description: 'Familiarize yourself with the writing system first.',
        milestone: 'scriptOpened',
        action: { label: 'Open Script Lab', to: '/app/language/:langId/script-lab' },
      },
      {
        label: 'Start your first text',
        description: 'Open a beginner text and read along with glosses.',
        milestone: 'firstTextOpened',
        action: { label: 'Open Beginner Text', to: '/app/reader/:textId' },
      },
      {
        label: 'Save your first 10 words',
        description: 'Tap any unknown word and save it to your vocabulary.',
        milestone: 'firstWordSaved',
      },
      {
        label: 'Complete your first review',
        description: 'Go to Review and test what you have saved.',
        milestone: 'firstReviewCompleted',
        action: { label: 'Go to Review', to: '/app/review' },
      },
    ],
  },
  {
    id: 'know-alphabet',
    label: 'I know the alphabet',
    description: 'You can read the script — now start building vocabulary.',
    steps: [
      {
        label: 'Start A1 reading',
        description: 'Open a level A1 text and read with gloss support.',
        milestone: 'firstTextOpened',
        action: { label: 'Open A1 Text', to: '/app/reader/:textId' },
      },
      {
        label: 'Tap every unknown word',
        description: 'Build your vocabulary by saving every word you do not know yet.',
        milestone: 'firstWordSaved',
      },
      {
        label: 'Save 20 learning words',
        description: 'Continue until you have at least 20 words in your learning list.',
      },
      {
        label: 'Review',
        description: 'Run a review session to reinforce what you just learned.',
        milestone: 'firstReviewCompleted',
        action: { label: 'Go to Review', to: '/app/review' },
      },
    ],
  },
  {
    id: 'read-slowly',
    label: 'I can read slowly',
    description: 'You can read with effort — now work on fluency and depth.',
    steps: [
      {
        label: 'Start an A2 / B1 text',
        description: 'Move to longer passages with richer vocabulary.',
        milestone: 'firstTextOpened',
        action: { label: 'Open Text', to: '/app/reader/:textId' },
      },
      {
        label: 'Use morphology',
        description: 'Tap words and study their grammatical forms in the analysis panel.',
      },
      {
        label: 'Create notes',
        description: 'Add personal notes to words and sentences as you read.',
        action: { label: 'Open Notebook', to: '/app/notebooks' },
      },
      {
        label: 'Use the AI Tutor',
        description: 'Ask the tutor to explain difficult passages.',
        action: { label: 'Open Tutor', to: '/app/tutor' },
      },
    ],
  },
  {
    id: 'academic',
    label: 'I am studying academically',
    description: 'You are ready for critical study — use the full scholarly toolkit.',
    steps: [
      {
        label: 'Use the Dictionary',
        description: 'Look up full lexical entries with citations and frequency.',
        action: { label: 'Open Dictionary', to: '/app/dictionary' },
      },
      {
        label: 'Use Notes & Notebooks',
        description: 'Organize your research with the notebook system.',
        action: { label: 'Open Notebooks', to: '/app/notebooks' },
      },
      {
        label: 'Use Syntax Trees',
        description: 'Explore syntactic structures for texts that have them.',
        action: { label: 'Open Syntax', to: '/app/syntax' },
      },
      {
        label: 'Use Grammar Pathways',
        description: 'Follow structured grammar lessons for your language.',
        action: { label: 'Open Grammar', to: '/app/grammar-pathways' },
      },
    ],
  },
];
