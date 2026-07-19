import { useEffect, useRef } from "react";

export default function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.innerWidth < 768) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let dotX = 0, dotY = 0;
    let prevX = 0, prevY = 0;
    let raf: number;
    let isHovering = false;

    const RING_SPRING = 0.08;
    const DOT_SPRING = 0.18;
    const RING_SIZE = 44;
    const HOVER_SIZE = 64;

    function animate() {
      ringX += (mouseX - ringX) * RING_SPRING;
      ringY += (mouseY - ringY) * RING_SPRING;
      dotX += (mouseX - dotX) * DOT_SPRING;
      dotY += (mouseY - dotY) * DOT_SPRING;

      // 速度感知：移动越快外圈越大
      const vx = mouseX - prevX;
      const vy = mouseY - prevY;
      const speed = Math.sqrt(vx * vx + vy * vy);
      const stretch = Math.min(speed * 0.01, 0.3);
      const size = isHovering ? HOVER_SIZE : RING_SIZE + speed * 0.15;
      prevX = mouseX;
      prevY = mouseY;

      // 根据移动方向拉伸
      const angle = Math.atan2(vy, vx);
      const scaleX = 1 + stretch * Math.abs(Math.cos(angle));
      const scaleY = 1 + stretch * Math.abs(Math.sin(angle));

      ring.style.transform = `translate(${ringX - size / 2}px, ${ringY - size / 2}px) scale(${scaleX}, ${scaleY}) rotate(${angle}rad)`;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;

      raf = requestAnimationFrame(animate);
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function onMouseOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button'], input, textarea, select, label")) {
        isHovering = true;
        ring.classList.add("cursor-hover");
      }
    }

    function onMouseOut(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button'], input, textarea, select, label")) {
        isHovering = false;
        ring.classList.remove("cursor-hover");
      }
    }

    document.documentElement.classList.add("custom-cursor");
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    animate();

    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="cursor-ring fixed top-0 left-0 z-[9999] pointer-events-none rounded-full border-2 border-primary/50"
        style={{ width: 44, height: 44, willChange: "transform" }}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none w-[8px] h-[8px] rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
