import { apiFetch } from './apiFetch.js';

export interface ChallengeCompletion {
  challengeId: string;
  completedAt: string;
  metric: string;
  value: number;
}

export const ChallengeService = {
  async getCompletions(): Promise<ChallengeCompletion[]> {
    const data = await apiFetch<{ completions: ChallengeCompletion[] }>(
      '/api/challenges/completions'
    );
    return data?.completions ?? [];
  },

  async recordCompletion(challengeId: string, metric: string, value: number): Promise<void> {
    await apiFetch('/api/challenges/completions', {
      method: 'POST',
      body: JSON.stringify({ challengeId, metric, value }),
    });
  },
};
