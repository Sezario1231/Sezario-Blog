import { useEffect, useRef } from "react";

interface GiscusProps {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  term: string;
}

const GISCUS_SCRIPT_ID = "giscus-script";

export default function Giscus({ repo, repoId, category, categoryId, term }: GiscusProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = document.getElementById(GISCUS_SCRIPT_ID);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.id = GISCUS_SCRIPT_ID;
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", term);
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "zh-CN");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    ref.current?.appendChild(script);

    return () => {
      const el = document.getElementById(GISCUS_SCRIPT_ID);
      el?.remove();
    };
  }, [repo, repoId, category, categoryId, term]);

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-lg font-semibold mb-6">评论</h3>
      <div ref={ref} />
    </div>
  );
}
