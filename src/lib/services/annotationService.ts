import { getAuth } from 'firebase/auth';

export interface TokenAnnotation {
  id: string;
  lemma: string;
  wordText: string;
  languageId: string;
  gloss: string;
  authorUid: string;
  authorName: string;
  authorAvatarUrl: string | null;
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const user = getAuth().currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export const AnnotationService = {
  async list(lemma: string, languageId: string): Promise<TokenAnnotation[]> {
    const params = new URLSearchParams({ lemma, languageId });
    const res = await fetch(`/api/annotations?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.annotations ?? [];
  },

  async create(lemma: string, wordText: string, languageId: string, gloss: string): Promise<TokenAnnotation> {
    const headers = await authHeaders();
    const res = await fetch('/api/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ lemma, wordText, languageId, gloss }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create annotation');
    }
    return res.json();
  },

  async delete(annotationId: string): Promise<void> {
    const headers = await authHeaders();
    const res = await fetch(`/api/annotations/${annotationId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete annotation');
  },

  async upvote(annotationId: string): Promise<{ upvoted: boolean; upvotes: number }> {
    const headers = await authHeaders();
    const res = await fetch(`/api/annotations/${annotationId}/upvote`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) throw new Error('Failed to upvote');
    return res.json();
  },
};
