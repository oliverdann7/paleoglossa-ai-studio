import { useState, useEffect, useRef } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, ThumbsUp, Trash2, Reply, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../lib/hooks/useAuth.js';
import { DiscussionService } from '../../lib/services/discussionService.js';
import type { DiscussionThread, DiscussionComment } from '../../types/firestore.js';

interface DiscussionPanelProps {
  textId: string;
  languageId: string;
  sentenceIndex: number;
  tokenIndex?: number | null;
  wordText?: string;
  lemma?: string;
  sentenceExcerpt?: string;
}

function formatCommentDate(createdAt: unknown): string {
  if (!createdAt) return '';
  try {
    const d = typeof createdAt === 'string' ? new Date(createdAt) : new Date();
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

interface CommentItemProps {
  comment: DiscussionComment;
  currentUid?: string;
  discussionId: string;
  onReply: (commentId: string, authorName: string) => void;
  onDeleted: (commentId: string) => void;
  onUpvoted: (commentId: string, upvoted: boolean) => void;
}

function CommentItem({ comment, currentUid, discussionId, onReply, onDeleted, onUpvoted }: CommentItemProps) {
  const [upvoting, setUpvoting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = (comment.authorDisplayName || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleUpvote = async () => {
    if (upvoting || !currentUid) return;
    setUpvoting(true);
    try {
      const result = await DiscussionService.upvoteComment(discussionId, comment.id!);
      onUpvoted(comment.id!, result.upvoted);
    } catch {
      // silent
    } finally {
      setUpvoting(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await DiscussionService.deleteComment(discussionId, comment.id!);
      onDeleted(comment.id!);
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex gap-2.5 py-3">
      <div className="w-7 h-7 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {comment.authorAvatarUrl ? (
          <img src={comment.authorAvatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[9px] font-bold text-blue">{initials}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[11px] font-semibold text-ink">{comment.authorDisplayName}</span>
          <span className="text-[10px] text-muted">{formatCommentDate(comment.createdAt)}</span>
        </div>
        <p className="text-[12px] text-ink2 leading-relaxed whitespace-pre-wrap break-words">
          {comment.body}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <button
            onClick={handleUpvote}
            disabled={!currentUid || upvoting}
            className={cn(
              'flex items-center gap-1 text-[10px] transition-colors disabled:opacity-40',
              comment.upvoteCount > 0 ? 'text-blue' : 'text-muted hover:text-blue'
            )}
          >
            <ThumbsUp className="w-3 h-3" />
            {comment.upvoteCount > 0 && <span>{comment.upvoteCount}</span>}
          </button>
          {currentUid && (
            <button
              onClick={() => onReply(comment.id!, comment.authorDisplayName)}
              className="flex items-center gap-1 text-[10px] text-muted hover:text-blue transition-colors"
            >
              <Reply className="w-3 h-3" /> Reply
            </button>
          )}
          {currentUid === comment.authorUid && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 text-[10px] text-muted hover:text-ruby transition-colors ml-auto disabled:opacity-40"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
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
}: DiscussionPanelProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [thread, setThread] = useState<DiscussionThread | null>(null);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!expanded) return;

    const loadThread = async () => {
      setLoading(true);
      try {
        const threads = await DiscussionService.getThreads({ textId, sentenceIndex, tokenIndex });
        if (threads.length > 0) {
          const t = threads[0];
          setThread(t);
          const threadId = (t as any).id || '';
          if (threadId) {
            const cmts = await DiscussionService.getComments(threadId);
            setComments(cmts);
          }
        }
      } catch {
        // non-fatal
      } finally {
        setLoading(false);
      }
    };

    loadThread();
  }, [expanded, textId, sentenceIndex, tokenIndex]);

  const handlePost = async () => {
    if (!body.trim() || posting || !user) return;
    setPosting(true);
    try {
      let t = thread;
      if (!t) {
        t = await DiscussionService.getOrCreateThread({
          textId,
          languageId,
          sentenceIndex,
          tokenIndex,
          wordText,
          lemma,
          sentenceExcerpt,
        });
        setThread(t);
      }
      const threadId = (t as any).id || '';
      if (!threadId) return;
      const newComment = await DiscussionService.postComment({
        discussionId: threadId,
        body: body.trim(),
        parentCommentId: replyTo?.id ?? null,
      });
      setComments((prev) => [...prev, newComment]);
      setThread((prev) => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : prev);
      setBody('');
      setReplyTo(null);
    } catch {
      // silent
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePost();
    }
  };

  const topLevel = comments.filter((c) => !c.parentCommentId);
  const replies = comments.filter((c) => c.parentCommentId);

  const threadId = (thread as any)?.id || '';
  const commentCount = thread?.commentCount ?? 0;

  return (
    <div className="border border-bdr rounded-xl overflow-hidden mt-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-parch2/60 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-muted" />
          <span className="text-[12px] font-semibold text-ink2">
            Community Discussion
            {commentCount > 0 && (
              <span className="ml-1.5 text-[10px] font-bold text-blue bg-blue/10 px-1.5 py-0.5 rounded-full">
                {commentCount}
              </span>
            )}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-muted" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-bdr px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted" />
            </div>
          ) : (
            <>
              {topLevel.length === 0 && !loading && (
                <p className="text-[11px] text-muted italic py-4 text-center">
                  No comments yet. Be the first to ask!
                </p>
              )}
              <div className="divide-y divide-bdr/30">
                {topLevel.map((comment) => (
                  <div key={comment.id}>
                    <CommentItem
                      comment={comment}
                      currentUid={user?.uid}
                      discussionId={threadId}
                      onReply={(id, name) => {
                        setReplyTo({ id, name });
                        textareaRef.current?.focus();
                      }}
                      onDeleted={(id) => setComments((prev) => prev.filter((c) => c.id !== id))}
                      onUpvoted={(id, upvoted) =>
                        setComments((prev) =>
                          prev.map((c) =>
                            c.id === id
                              ? { ...c, upvoteCount: c.upvoteCount + (upvoted ? 1 : -1) }
                              : c
                          )
                        )
                      }
                    />
                    {replies
                      .filter((r) => r.parentCommentId === comment.id)
                      .map((reply) => (
                        <div key={reply.id} className="ml-8">
                          <CommentItem
                            comment={reply}
                            currentUid={user?.uid}
                            discussionId={threadId}
                            onReply={(id, name) => {
                              setReplyTo({ id, name });
                              textareaRef.current?.focus();
                            }}
                            onDeleted={(id) => setComments((prev) => prev.filter((c) => c.id !== id))}
                            onUpvoted={(id, upvoted) =>
                              setComments((prev) =>
                                prev.map((c) =>
                                  c.id === id
                                    ? { ...c, upvoteCount: c.upvoteCount + (upvoted ? 1 : -1) }
                                    : c
                                )
                              )
                            }
                          />
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {user ? (
            <div className="mt-3 space-y-2">
              {replyTo && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted bg-parch2 rounded px-2 py-1">
                  <Reply className="w-3 h-3" />
                  <span>Replying to <strong>{replyTo.name}</strong></span>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="ml-auto hover:text-ink"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  maxLength={2000}
                  placeholder="Ask a question or share an insight… (⌘↵ to send)"
                  className="flex-1 text-[12px] bg-parch border border-bdr rounded-lg px-3 py-2 text-ink placeholder:text-muted resize-none focus:outline-none focus:ring-1 focus:ring-blue/40 focus:border-blue/50 transition-all"
                />
                <button
                  onClick={handlePost}
                  disabled={!body.trim() || posting}
                  className="flex items-center justify-center w-9 h-9 self-end rounded-lg bg-blue text-white hover:bg-blue/80 transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  {posting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-muted italic mt-3 text-center">
              Sign in to join the discussion.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
