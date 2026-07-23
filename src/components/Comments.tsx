import { useCallback, useEffect, useRef, useState } from "react";

interface Comment {
  id: string;
  post_slug: string;
  author: string;
  content: string;
  parent_id: string | null;
  created_at: string;
}

interface CommentsProps {
  slug: string;
}

export default function Comments({ slug }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!author.trim()) {
      setError("请输入昵称");
      return;
    }
    if (!content.trim()) {
      setError("请输入评论内容");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_slug: slug,
          author: author.trim(),
          email: email.trim() || undefined,
          content: content.trim(),
          parent_id: replyTo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("评论已提交！");
        setAuthor("");
        setEmail("");
        setContent("");
        setReplyTo(null);
        setTimeout(() => setSuccess(""), 3000);
        fetchComments();
      } else {
        setError(data.message || "提交失败");
      }
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (id: string) => {
    setReplyTo(id);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const topComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-lg font-semibold mb-6">评论</h3>

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中...</p>
      ) : topComments.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-8">暂无评论，来写第一条吧</p>
      ) : (
        <div className="space-y-6 mb-8">
          {topComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              formatDate={formatDate}
              onReply={handleReply}
            />
          ))}
        </div>
      )}

      <div ref={formRef} className="rounded-xl border border-border bg-card/50 p-5">
        {replyTo && (
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
            <span>回复评论中</span>
            <button onClick={cancelReply} className="text-primary hover:underline">
              取消回复
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-lg">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="昵称 *"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              maxLength={50}
            />
            <input
              type="email"
              placeholder="邮箱（选填，仅用于头像）"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              maxLength={100}
            />
          </div>
          <textarea
            placeholder="写下你的评论..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-y"
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{content.length}/2000</span>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitting ? "提交中..." : "发表评论"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  formatDate,
  onReply,
}: {
  comment: Comment;
  replies: Comment[];
  formatDate: (iso: string) => string;
  onReply: (id: string) => void;
}) {
  return (
    <div className="border-b border-border/40 pb-5 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
          {comment.author.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{comment.author}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          <button
            onClick={() => onReply(comment.id)}
            className="mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            回复
          </button>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-10 mt-4 space-y-4 pl-4 border-l-2 border-border/50">
          {replies.map((reply) => (
            <div key={reply.id} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                {reply.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{reply.author}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
