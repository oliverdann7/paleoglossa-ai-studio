import { describe, it, expect } from 'vitest';
import { MorphologyService } from '../morphologyService';

describe('MorphologyService morphology display formatting', () => {
  it('formats Greek morphology correctly (case, number, gender, aspect)', () => {
    const morphology = {
      partOfSpeech: 'noun',
      case: 'dative',
      number: 'singular',
      gender: 'feminine',
    };
    const formatted = MorphologyService.formatMorphologyForDisplay('grc', morphology);
    expect(formatted.compact).toContain('noun · dative · singular · feminine');
    expect(formatted.expanded).toContainEqual({ label: 'Part of speech', value: 'Noun' });
    expect(formatted.expanded).toContainEqual({ label: 'Case', value: 'Dative' });
  });

  it('formats Greek verb morphology correctly (tense, aspect, mood, person)', () => {
    const morphology = {
      partOfSpeech: 'verb',
      tense: 'present',
      aspect: 'imperfective',
      mood: 'indicative',
      person: '3rd',
      number: 'singular',
    };
    const formatted = MorphologyService.formatMorphologyForDisplay('grc', morphology);
    const parts = formatted.compact.split(' · ');
    expect(parts).toContain('verb');
    expect(parts).toContain('3rd');
    expect(parts).toContain('present');
    expect(parts).toContain('imperfective');
    expect(parts).toContain('indicative');
    expect(formatted.expanded).toContainEqual({ label: 'Aspect', value: 'Imperfective' });
    expect(formatted.expanded).toContainEqual({ label: 'Mood', value: 'Indicative' });
  });

  it('formats Hebrew morphology correctly (stem, binyan, aspect)', () => {
    const morphology = {
      partOfSpeech: 'verb',
      stem: 'hithpael',
      binyan: 'hithpael',
      aspect: 'imperfective',
      person: '2nd',
    };
    const formatted = MorphologyService.formatMorphologyForDisplay('hbo', morphology);
    const parts = formatted.compact.split(' · ');
    expect(parts).toContain('verb');
    expect(parts).toContain('2nd');
    expect(parts).toContain('imperfective');
    expect(parts).toContain('hithpael');
    expect(formatted.expanded).toContainEqual({ label: 'Stem', value: 'Hithpael' });
    expect(formatted.expanded).toContainEqual({ label: 'Binyan', value: 'Hithpael' });
    expect(formatted.expanded).toContainEqual({ label: 'Aspect', value: 'Imperfective' });
  });

  it('formats Latin morphology correctly (declension, conjugation)', () => {
    const morphology = {
      partOfSpeech: 'noun',
      declension: '1st',
      case: 'nominative',
      number: 'singular',
    };
    const formatted = MorphologyService.formatMorphologyForDisplay('lat', morphology);
    expect(formatted.compact).toContain('noun · nominative · singular · 1st');
    expect(formatted.expanded).toContainEqual({ label: 'Declension', value: '1st' });
  });

  it('handles unknown fields gracefully', () => {
    const morphology = {
      partOfSpeech: 'noun',
      unknownField: 'someValue',
    };
    const formatted = MorphologyService.formatMorphologyForDisplay('grc', morphology);
    expect(formatted.compact).toContain('noun');
    expect(formatted.expanded).toContainEqual({ label: 'Part of speech', value: 'Noun' });
    expect(formatted.expanded).toContainEqual({ label: 'UnknownField', value: 'SomeValue' });
  });
});
