/**
 * Reading pathways — a curated order of authentic texts that leads a learner
 * from first words to a named destination ("read Mark", "read Caesar").
 *
 * Deliberately small and hand-ordered: the order encodes teaching judgement
 * (1 John before Mark, Jonah before Genesis) that vocabulary coverage alone
 * does not capture. The recommender still handles everything off the path.
 *
 * Pure data + pure functions. No corpus import: text IDs are checked against
 * the corpus by `pathways.test.ts`.
 */

export interface PathwayStep {
  textId: string;
  /** Why this text sits here — shown to the learner. */
  why: string;
  /** A destination the learner can choose to aim for. */
  goal?: string;
}

export interface Pathway {
  languageId: string;
  title: string;
  steps: PathwayStep[];
}

export const PATHWAYS: Pathway[] = [
  {
    languageId: 'grc-koine',
    title: 'Koine Greek',
    steps: [
      { textId: 'grc-koine-vocab', why: 'The hundred commonest words carry half of every page.' },
      { textId: 'GrcMini', why: 'Short graded stories built from those words.' },
      {
        textId: 'grc-koine-1-john-full',
        why: 'The gentlest authentic Greek: a small vocabulary, repeated often.',
        goal: 'Read 1 John',
      },
      { textId: 'Jn-full', why: 'The same writer and vocabulary, at the length of a book.' },
      {
        textId: 'grc-koine-mark-full',
        why: 'Fast narrative in plain Greek; the usual first Gospel.',
        goal: 'Read the Gospel of Mark',
      },
      { textId: 'grc-koine-philippians-full', why: 'A first letter of Paul: argument, not story.' },
      {
        textId: 'grc-koine-acts-full',
        why: 'Longer sentences and a wider, more literary vocabulary.',
      },
      {
        textId: 'grc-koine-romans-full',
        why: 'Sustained argument; the benchmark for reading Paul.',
        goal: 'Read Romans',
      },
      { textId: 'grc-koine-hebrews-full', why: 'The most polished Greek in the New Testament.' },
    ],
  },
  {
    languageId: 'lat',
    title: 'Classical Latin',
    steps: [
      { textId: 'lat-vocab', why: 'The hundred commonest words carry half of every page.' },
      { textId: 'LatMini', why: 'Short graded stories built from those words.' },
      {
        textId: 'lat-disticha-catonis-full',
        why: 'Two-line maxims: real Latin in the smallest unit.',
      },
      {
        textId: 'lat-vulgate-john-full',
        why: 'Simple syntax and a familiar story, at the length of a book.',
        goal: 'Read the Gospel of John in Latin',
      },
      {
        textId: 'Caesar-BG-1',
        why: 'The traditional first classical author: clear, regular prose.',
        goal: 'Read Caesar',
      },
      { textId: 'lat-jerome-vita-malchi-full', why: 'A short adventure in late, readable Latin.' },
      {
        textId: 'lat-sallust-catilinae-full',
        why: 'Compressed historical prose; a step up from Caesar.',
      },
      {
        textId: 'lat-cicero-in-catilinam-full',
        why: 'Periodic sentences and rhetoric at full stretch.',
        goal: 'Read Cicero',
      },
      {
        textId: 'lat-vergil-aeneid-full',
        why: 'Verse: free word order and poetic vocabulary.',
        goal: 'Read the Aeneid',
      },
    ],
  },
  {
    languageId: 'hbo',
    title: 'Biblical Hebrew',
    steps: [
      { textId: 'heb-vocab', why: 'The hundred commonest words carry half of every page.' },
      { textId: 'HebMini', why: 'Short graded stories built from those words.' },
      {
        textId: 'hbo-jonah-full',
        why: 'Four short chapters of straightforward narrative.',
        goal: 'Read Jonah',
      },
      { textId: 'hbo-ruth-full', why: 'Narrative with dialogue; a little more vocabulary.' },
      { textId: 'Heb-Ps23', why: 'A first taste of poetry, in six verses.' },
      {
        textId: 'hbo-genesis-full',
        why: 'Classical prose at length; the core of the narrative vocabulary.',
        goal: 'Read Genesis',
      },
      { textId: 'Heb-Isa40', why: 'Prophetic poetry: parallelism and rarer words.' },
    ],
  },
];

export function getPathway(languageId: string | undefined | null): Pathway | undefined {
  return PATHWAYS.find((p) => p.languageId === languageId);
}

/** The steps that are destinations, in order. */
export function pathwayGoals(pathway: Pathway): PathwayStep[] {
  return pathway.steps.filter((s) => s.goal);
}

export interface PathwayPosition {
  pathway: Pathway;
  /** The destination being aimed for (the chosen one, else the next unreached). */
  goal: PathwayStep;
  /** Steps from the start up to and including the goal. */
  steps: PathwayStep[];
  /** How many of those are behind the learner (finished or passed over). */
  done: number;
  /** The first unfinished step on the way to the goal; undefined once reached. */
  next: PathwayStep | undefined;
}

/**
 * Where a learner stands on a language's pathway.
 * @param finished  IDs of texts the learner has finished
 * @param goalTextId  the learner's chosen destination, if any
 */
export function pathwayPosition(
  languageId: string | undefined | null,
  finished: ReadonlySet<string>,
  goalTextId?: string | null
): PathwayPosition | undefined {
  const pathway = getPathway(languageId);
  if (!pathway) return undefined;
  const goals = pathwayGoals(pathway);
  const goal =
    goals.find((g) => g.textId === goalTextId) ??
    goals.find((g) => !finished.has(g.textId)) ??
    goals[goals.length - 1];
  const steps = pathway.steps.slice(0, pathway.steps.indexOf(goal) + 1);
  // A learner who starts partway along (straight into Mark) has passed the
  // earlier steps: progress is measured from the furthest text finished, and
  // nobody is sent back to the word list.
  let furthest = -1;
  steps.forEach((s, i) => {
    if (finished.has(s.textId)) furthest = i;
  });
  const nextAt = steps.findIndex((s, i) => i > furthest && !finished.has(s.textId));
  return {
    pathway,
    goal,
    steps,
    done: nextAt < 0 ? steps.length : nextAt,
    next: nextAt < 0 ? undefined : steps[nextAt],
  };
}
