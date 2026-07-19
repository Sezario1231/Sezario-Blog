import * as React from "react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  name: string;
  description: string;
  techStack: string[];
  github?: string;
  demo?: string;
  className?: string;
  style?: React.CSSProperties;
  "data-animate"?: string;
}

export default function ProjectCard({
  name,
  description,
  techStack,
  github,
  demo,
  className,
  style,
  ...rest
}: ProjectCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
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
    <div
      className={cn(
        "group relative rounded-2xl perspective-[600px]",
        className
      )}
      style={style}
      {...rest}
    >
      <div
        ref={cardRef}
        className="relative rounded-2xl border border-border/60 bg-card p-6 hover:shadow-xl hover:border-primary/25 overflow-hidden h-full"
        style={{
          boxShadow: "0 2px 8px rgba(120,60,20,0.04), 0 8px 24px rgba(120,60,20,0.03)",
          transformStyle: "preserve-3d",
          transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s, border-color 0.3s",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
      {/* 光泽层 */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 z-10"
        style={{ opacity: 0 }}
      />

      <div className="relative z-20">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold group-hover:text-primary transition-colors duration-200 tracking-tight">
            {name}
          </h3>
          <div className="flex gap-1.5">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
                aria-label={`${name} GitHub`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}
            {demo && (
              <a
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
                aria-label={`${name} Demo`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-1.5">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded-full bg-primary/10 border border-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
