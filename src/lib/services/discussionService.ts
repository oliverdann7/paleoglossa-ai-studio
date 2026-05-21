import { apiFetch } from './apiFetch.js';
import type { DiscussionThread, DiscussionComment } from '../../types/firestore.js';

interface GetThreadsParams {
  textId: string;
  sentenceIndex?: number;
  tokenIndex?: number | null;
}

interface PostCommentParams {
  discussionId: string;
  body: string;
  parentCommentId?: string | null;
}

export const DiscussionService = {
  async getThreads(params: GetThreadsParams): Promise<DiscussionThread[]> {
    let url = `/api/discussions?textId=${encodeURIComponent(params.textId)}`;
    if (params.sentenceIndex != null) url += `&sentenceIndex=${params.sentenceIndex}`;
    if (params.tokenIndex != null) url += `&tokenIndex=${params.tokenIndex}`;
    const data = await apiFetch<{ threads: DiscussionThread[] }>(url, { skipAuth: true });
    return data?.threads ?? [];
  },

  async getOrCreateThread(params: {
    textId: string;
    languageId: string;
    sentenceIndex: number;
    tokenIndex?: number | null;
    wordText?: string;
    lemma?: string;
    sentenceExcerpt?: string;
  }): Promise<DiscussionThread> {
    return apiFetch<DiscussionThread>('/api/discussions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getComments(discussionId: string): Promise<DiscussionComment[]> {
    const data = await apiFetch<{ comments: DiscussionComment[] }>(
      `/api/discussions/${encodeURIComponent(discussionId)}/comments`,
      { skipAuth: true }
    );
    return data?.comments ?? [];
  },

  async postComment(params: PostCommentParams): Promise<DiscussionComment> {
    return apiFetch<DiscussionComment>(
      `/api/discussions/${encodeURIComponent(params.discussionId)}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ body: params.body, parentCommentId: params.parentCommentId }),
      }
    );
  },

  async upvoteComment(discussionId: string, commentId: string): Promise<{ upvoted: boolean }> {
    return apiFetch<{ upvoted: boolean }>(
      `/api/discussions/${encodeURIComponent(discussionId)}/comments/${encodeURIComponent(commentId)}/upvote`,
      { method: 'POST' }
    );
  },

  async deleteComment(discussionId: string, commentId: string): Promise<void> {
    await apiFetch<{ deleted: boolean }>(
      `/api/discussions/${encodeURIComponent(discussionId)}/comments/${encodeURIComponent(commentId)}`,
      { method: 'DELETE' }
    );
  },
};
