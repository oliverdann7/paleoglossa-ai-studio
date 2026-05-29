import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  getTreebankSentence,
  _resetTreebankIndexForTests,
} from '../_lib/treebankIndex';

const SCRATCH = join(tmpdir(), 'paleoglossa-treebank-test');

function writeSidecar(filename: string, body: object) {
  writeFileSync(join(SCRATCH, filename), JSON.stringify(body), 'utf-8');
}

describe('treebankIndex', () => {
  beforeEach(() => {
    rmSync(SCRATCH, { recursive: true, force: true });
    mkdirSync(SCRATCH, { recursive: true });
    process.env.TREEBANK_DIR = SCRATCH;
    _resetTreebankIndexForTests();
  });

  afterEach(() => {
    rmSync(SCRATCH, { recursive: true, force: true });
    delete process.env.TREEBANK_DIR;
    _resetTreebankIndexForTests();
  });

  it('returns null when no sidecars are installed', () => {
    expect(getTreebankSentence('iliad-1', 0)).toBeNull();
  });

  it('returns the sidecar sentence for a known textId+index', () => {
    writeSidecar('iliad.json', {
      schemaVersion: 1,
      source: 'proiel',
      textId: 'iliad-1',
      sentences: {
        'iliad-1_0': {
          source: 'proiel',
          sourceSentenceId: '100',
          citation: 'Hom. Il. 1.1',
          tokens: [
            { index: 0, surface: 'μῆνιν', lemma: 'μῆνις', relation: 'obj', head: 1 },
            { index: 1, surface: 'ἄειδε', lemma: 'ἀείδω', relation: 'pred', head: -1 },
          ],
        },
      },
    });
    const sentence = getTreebankSentence('iliad-1', 0);
    expect(sentence).not.toBeNull();
    expect(sentence?.citation).toBe('Hom. Il. 1.1');
    expect(sentence?.tokens).toHaveLength(2);
  });

  it('merges sidecars from multiple files into one index', () => {
    writeSidecar('iliad.json', {
      schemaVersion: 1,
      source: 'proiel',
      textId: 'iliad-1',
      sentences: {
        'iliad-1_0': {
          source: 'proiel',
          sourceSentenceId: '1',
          tokens: [{ index: 0, surface: 'a', lemma: 'a', relation: 'root', head: -1 }],
        },
      },
    });
    writeSidecar('aeneid.json', {
      schemaVersion: 1,
      source: 'proiel',
      textId: 'aeneid-1',
      sentences: {
        'aeneid-1_0': {
          source: 'proiel',
          sourceSentenceId: '1',
          tokens: [{ index: 0, surface: 'arma', lemma: 'arma', relation: 'obj', head: -1 }],
        },
      },
    });

    expect(getTreebankSentence('iliad-1', 0)?.tokens[0].surface).toBe('a');
    expect(getTreebankSentence('aeneid-1', 0)?.tokens[0].surface).toBe('arma');
  });

  it('silently skips sidecars with unsupported schema versions', () => {
    writeSidecar('future.json', {
      schemaVersion: 999,
      source: 'proiel',
      textId: 'iliad-1',
      sentences: {
        'iliad-1_0': { source: 'proiel', sourceSentenceId: '1', tokens: [] },
      },
    });
    expect(getTreebankSentence('iliad-1', 0)).toBeNull();
  });

  it('returns null for unknown text/sentence combos', () => {
    writeSidecar('iliad.json', {
      schemaVersion: 1,
      source: 'proiel',
      textId: 'iliad-1',
      sentences: {
        'iliad-1_0': {
          source: 'proiel',
          sourceSentenceId: '1',
          tokens: [{ index: 0, surface: 'a', lemma: 'a', relation: 'root', head: -1 }],
        },
      },
    });
    expect(getTreebankSentence('iliad-1', 99)).toBeNull();
    expect(getTreebankSentence('odyssey-1', 0)).toBeNull();
  });

  it('survives a malformed JSON file in the directory', () => {
    writeFileSync(join(SCRATCH, 'broken.json'), '{not valid', 'utf-8');
    writeSidecar('good.json', {
      schemaVersion: 1,
      source: 'proiel',
      textId: 'iliad-1',
      sentences: {
        'iliad-1_0': {
          source: 'proiel',
          sourceSentenceId: '1',
          tokens: [{ index: 0, surface: 'a', lemma: 'a', relation: 'root', head: -1 }],
        },
      },
    });
    expect(getTreebankSentence('iliad-1', 0)?.tokens[0].surface).toBe('a');
  });
});
