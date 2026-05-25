import { apiFetch } from './apiFetch.js';
import type { DiscussionThread, DiscussionComment } from '../../types/firestore.js';

export interface CommentWithMeta extends DiscussionComment {
  id: string;
  /** Whether the current user has upvoted this comment */
  userUpvoted?: boolean;
}

export interface ThreadOptions {
  textId: string;
  languageId?: string;
  sentenceIndex: number;
  tokenIndex?: number | null;
  wordText?: string;
  lemma?: string;
  sentenceExcerpt?: string;
}

export const DiscussionService = {
  async getThreads(textId: string, sentenceIndex: number, tokenIndex?: number | null) {
    const params = new URLSearchParams({
      textId,
      sentenceIndex: String(sentenceIndex),
    });
    if (tokenIndex != null) params.set('tokenIndex', String(tokenIndex));
    const data = await apiFetch<{ threads: (DiscussionThread & { id: string })[] }>(
      `/api/discussions?${params}`,
      { skipAuth: true }
    );
    return data.threads;
  },

  async getOrCreateThread(opts: ThreadOptions) {
    return apiFetch<DiscussionThread & { id: string }>('/api/discussions', {
      method: 'POST',
      body: opts,
    });
  },

  async getComments(discussionId: string) {
    const data = await apiFetch<{ comments: CommentWithMeta[] }>(
      `/api/discussions/${discussionId}/comments`,
      { skipAuth: true }
    );
    return data.comments;
  },

  async postComment(discussionId: string, body: string, parentCommentId?: string) {
    return apiFetch<CommentWithMeta>(`/api/discussions/${discussionId}/comments`, {
      method: 'POST',
      body: { body, parentCommentId },
    });
  },

  async upvoteComment(discussionId: string, commentId: string) {
    return apiFetch<{ upvoted: boolean; upvoteCount: number }>(
      `/api/discussions/${discussionId}/comments/${commentId}/upvote`,
      { method: 'POST' }
    );
  },

  async deleteComment(discussionId: string, commentId: string) {
    return apiFetch<{ ok: boolean }>(`/api/discussions/${discussionId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};
