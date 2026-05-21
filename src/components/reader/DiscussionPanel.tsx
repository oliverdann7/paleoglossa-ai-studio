import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, ThumbsUp, Send, Loader2, Trash2, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuth } from '../../lib/hooks/useAuth.js';
import { DiscussionService } from '../../lib/services/discussionService.js';
import { AuthRequiredError } from '../../lib/services/apiFetch.js';
import type { CommentWithMeta } from '../../lib/services/discussionService.js';

interface Props {
  textId: string;
  languageId: string;
  sentenceIndex: number;
  /** Provide for word-level threads */
  tokenIndex?: number | null;
  wordText?: string;
  lemma?: string;
  sentenceExcerpt?: string;
}

function formatCommentDate(createdAt: unknown): string {
  try {
    const d =
      typeof createdAt === 'string'
        ? new Date(createdAt)
        : (createdAt as any)?.toDate?.();
    if (!d) return '';
    const diff = Date.now() - d.getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function CommentItem({
  comment,
  currentUid,
  onUpvote,
  onDelete,
  onReply,
  isReply,
}: {
  comment: CommentWithMeta;
  currentUid: string | null;
  onUpvote: (id: string) => void;
  onDelete: (id: string) => void;
  onReply: (id: string, displayName: string) => void;
  isReply?: boolean;
}) {
  const { t } = useTranslation();
  const isOwn = currentUid === comment.authorUid;
  const formattedDate = formatCommentDate(comment.createdAt);

  return (
    <div className={cn('group', isReply && 'ml-6 pl-3 border-l border-bdr/40')}>
      <div className="flex items-start gap-2.5 py-2.5">
        {/* Avatar */}
        {comment.authorAvatarUrl ? (
          <img
            src={comment.authorAvatarUrl}
            alt=""
            className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-bluexl flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[11px] font-bold text-blue">
              {(comment.authorDisplayName || '?')[0].toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[12px] font-semibold text-ink truncate">
              {comment.authorDisplayName}
            </span>
            {formattedDate && (
              <span className="text-[11px] text-muted shrink-0">{formattedDate}</span>
            )}
          </div>
          <p className="text-[13px] text-ink2 leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
            {comment.body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => onUpvote(comment.id!)}
              className={cn(
                'flex items-center gap-1 text-[11px] transition-colors',
                comment.userUpvoted ? 'text-blue font-semibold' : 'text-muted hover:text-blue'
              )}
            >
              <ThumbsUp className="w-3 h-3" />
              {comment.upvoteCount > 0 && <span>{comment.upvoteCount}</span>}
            </button>
            {!isReply && currentUid && (
              <button
                onClick={() => onReply(comment.id!, comment.authorDisplayName)}
                className="text-[11px] text-muted hover:text-blue transition-colors flex items-center gap-1"
              >
                <CornerDownRight className="w-3 h-3" />
                {t('discussion.reply', 'Reply')}
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => onDelete(comment.id!)}
                className="text-[11px] text-muted hover:text-red-500 transition-colors ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DiscussionPanel({
  textId,
  languageId,
  sentenceIndex,
  tokenIndex,
  wordText,
  lemma,
  sentenceExcerpt,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [discussionId, setDiscussionId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentWithMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; displayName: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const currentUid = user?.uid ?? null;

  const loadThread = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const threads = await DiscussionService.getThreads(textId, sentenceIndex, tokenIndex);
      if (threads.length > 0) {
        const thread = threads[0];
        setDiscussionId(thread.id);
        const fetched = await DiscussionService.getComments(thread.id);
        setComments(fetched);
      } else {
        setDiscussionId(null);
        setComments([]);
      }
    } catch {
      setError(t('discussion.loadError', 'Could not load discussion.'));
    } finally {
      setLoading(false);
    }
  }, [textId, sentenceIndex, tokenIndex, t]);

  useEffect(() => {
    if (isExpanded) {
      loadThread(); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [isExpanded, loadThread]);

  const ensureThread = async (): Promise<string> => {
    if (discussionId) return discussionId;
    const thread = await DiscussionService.getOrCreateThread({
      textId,
      languageId,
      sentenceIndex,
      tokenIndex,
      wordText,
      lemma,
      sentenceExcerpt,
    });
    setDiscussionId(thread.id);
    return thread.id;
  };

  const handlePost = async () => {
    const body = draft.trim();
    if (!body || posting) return;
    if (!user) {
      setError(t('discussion.signInRequired', 'Sign in to join the discussion.'));
      return;
    }

    setPosting(true);
    setError(null);
    try {
      const threadId = await ensureThread();
      const comment = await DiscussionService.postComment(
        threadId,
        body,
        replyTo?.id
      );
      setComments((prev) => [...prev, comment]);
      setDraft('');
      setReplyTo(null);
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) {
      if (e instanceof AuthRequiredError) {
        setError(t('discussion.signInRequired', 'Sign in to join the discussion.'));
      } else {
        setError(t('discussion.postError', 'Failed to post. Please try again.'));
      }
    } finally {
      setPosting(false);
    }
  };

  const handleUpvote = async (commentId: string) => {
    if (!user) return;
    if (!discussionId) return;
    try {
      const result = await DiscussionService.upvoteComment(discussionId, commentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, upvoteCount: result.upvoteCount, userUpvoted: result.upvoted }
            : c
        )
      );
    } catch {
      // silent
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!discussionId) return;
    try {
      await DiscussionService.deleteComment(discussionId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setError(t('discussion.deleteError', 'Failed to delete comment.'));
    }
  };

  const handleReply = (id: string, displayName: string) => {
    setReplyTo({ id, displayName });
    setDraft(`@${displayName} `);
    textareaRef.current?.focus();
  };

  const topLevelComments = comments.filter((c) => !c.parentCommentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentCommentId === parentId);
  const totalCount = comments.length;

  return (
    <div className="border-t border-bdr/30 mt-8">
      {/* Toggle header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <div className="eyebrow flex items-center gap-2 text-ink">
          <MessageSquare className="w-3 h-3 opacity-60" />
          {t('discussion.communityDiscussion', 'Community Discussion')}
          {totalCount > 0 && (
            <span className="bg-blue/10 text-blue text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {totalCount}
            </span>
          )}
        </div>
        <div className="text-muted group-hover:text-ink transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="pb-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted" />
            </div>
          ) : (
            <>
              {/* Comment list */}
              {topLevelComments.length === 0 ? (
                <p className="text-[12px] text-muted text-center py-4 italic">
                  {t('discussion.empty', 'No comments yet. Be the first to discuss!')}
                </p>
              ) : (
                <div className="space-y-0 divide-y divide-bdr/20 mb-4">
                  {topLevelComments.map((comment) => (
                    <div key={comment.id}>
                      <CommentItem
                        comment={comment}
                        currentUid={currentUid}
                        onUpvote={handleUpvote}
                        onDelete={handleDelete}
                        onReply={handleReply}
                      />
                      {getReplies(comment.id!).map((reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          currentUid={currentUid}
                          onUpvote={handleUpvote}
                          onDelete={handleDelete}
                          onReply={handleReply}
                          isReply
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <div ref={commentsEndRef} />

              {/* Reply indicator */}
              {replyTo && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-blue/5 border border-blue/20 rounded-t-lg text-[11px] text-blue">
                  <span>
                    {t('discussion.replyingTo', 'Replying to')} <strong>{replyTo.displayName}</strong>
                  </span>
                  <button onClick={() => { setReplyTo(null); setDraft(''); }} className="hover:text-blue/70">✕</button>
                </div>
              )}

              {/* Composer */}
              {error && (
                <p className="text-[11px] text-red-500 mb-1.5 px-1">{error}</p>
              )}
              <div className={cn('flex gap-2 items-end', replyTo && 'border border-blue/20 rounded-b-lg border-t-0 p-2 bg-blue/5')}>
                <textarea
                  ref={textareaRef}
                  rows={2}
                  className={cn(
                    'flex-1 text-[12px] font-body resize-none rounded-xl p-2.5 border focus:outline-none focus:border-blue transition-colors',
                    replyTo ? 'border-transparent bg-white' : 'bg-white border-bdr'
                  )}
                  placeholder={
                    user
                      ? t('discussion.placeholder', 'Ask a question or share an observation…')
                      : t('discussion.signInPrompt', 'Sign in to join the discussion')
                  }
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={!user}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handlePost();
                    }
                  }}
                />
                <button
                  onClick={handlePost}
                  disabled={!draft.trim() || posting || !user}
                  className="p-2.5 bg-blue text-white rounded-xl hover:bg-blue/80 disabled:opacity-40 transition-colors shrink-0"
                  title={t('discussion.post', 'Post (⌘↵)')}
                >
                  {posting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              {user && (
                <p className="text-[10px] text-muted mt-1 text-right">⌘↵ to post</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
