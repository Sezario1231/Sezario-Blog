import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";

const MarkdownEditor = lazy(() => import("./MarkdownEditor"));

export default function LazyMarkdownEditor(props: ComponentProps<typeof MarkdownEditor>) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[520px] rounded-xl border border-border/40 bg-card/50 text-sm text-muted-foreground/50">
          编辑器加载中...
        </div>
      }
    >
      <MarkdownEditor {...props} />
    </Suspense>
  );
}
