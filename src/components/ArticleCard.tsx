import * as React from "react";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  slug: string;
  title: string;
  date: Date;
  category: string;
  description: string;
  tags?: string[];
  className?: string;
  style?: React.CSSProperties;
  "data-animate"?: string;
}

export default function ArticleCard({
  slug,
  title,
  date,
  category,
  description,
  tags,
  className,
  style,
  ...rest
}: ArticleCardProps) {
  const cardRef = React.useRef<HTMLAnchorElement>(null);
  const glareRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -40;
    const rotateY = (x - 0.5) * 40;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(12px) scale3d(1.03, 1.03, 1.03)`;
    if (glare) {
      glare.style.opacity = "1";
      glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, hsl(var(--primary) / 0.15), transparent 60%)`;
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (card) card.style.transform = "";
    if (glare) {
      glare.style.opacity = "0";
      glare.style.background = "transparent";
    }
  };

  return (
    <a
      href={`/posts/${slug}`}
      className={cn(
        "group block rounded-xl perspective-[600px]",
        className
      )}
      style={style}
      {...rest}
    >
      <div
        ref={cardRef}
        className="rounded-xl border border-border/60 bg-card p-5 hover:shadow-xl hover:border-primary/25 overflow-hidden relative h-full"
        style={{
          boxShadow: "var(--card-shadow)",
          transformStyle: "preserve-3d",
          transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s, border-color 0.3s",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
      {/* 光泽层 */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none rounded-xl transition-opacity duration-300 z-10"
        style={{ opacity: 0 }}
      />

      <div className="relative z-20">
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <time dateTime={date.toISOString()}>
            {date.toLocaleDateString("zh-CN")}
          </time>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
          <span className="text-primary font-medium">{category}</span>
        </div>
        <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-3 leading-relaxed">
          {description}
        </p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-primary/8 border border-primary/10 px-2 py-0.5 text-[10px] text-primary/70 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      </div>
    </a>
  );
}
