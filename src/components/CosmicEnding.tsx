import { useEffect, useRef } from "react";

export default function CosmicEnding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const KEY = "plugin_cosmicEnding";
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const btn = btnRef.current;
    if (!section || !canvas || !btn) return;

    if (localStorage.getItem(KEY) === "off") {
      section.style.display = "none";
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let W = 0, H = 0;
    let time = 0;

    interface Star {
      x: number; y: number; z: number;
      size: number; speed: number;
      twinkleSpeed: number; twinkleOffset: number;
      hue: number; saturation: number;
    }

    interface Nebula {
      x: number; y: number;
      radius: number;
      hue: number; sat: number; light: number;
      alpha: number;
      driftX: number; driftY: number;
    }

    interface ShootingStar {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      tail: number;
    }

    let stars: Star[] = [];
    let nebulae: Nebula[] = [];
    let shootingStars: ShootingStar[] = [];
    let lastShootingStar = 0;

    function fitCanvas() {
      const rect = section!.getBoundingClientRect();
      W = canvas!.width = Math.max(rect.width, 100);
      H = canvas!.height = Math.max(rect.height, 100);
    }
    fitCanvas();
    window.addEventListener("resize", fitCanvas);

    function initNebulae() {
      nebulae = [
        { x: W * 0.2, y: H * 0.3, radius: W * 0.4, hue: 240, sat: 40, light: 15, alpha: 0.12, driftX: 0.02, driftY: 0.01 },
        { x: W * 0.75, y: H * 0.6, radius: W * 0.35, hue: 280, sat: 35, light: 12, alpha: 0.10, driftX: -0.015, driftY: 0.008 },
        { x: W * 0.5, y: H * 0.8, radius: W * 0.5, hue: 220, sat: 30, light: 10, alpha: 0.08, driftX: 0.01, driftY: -0.012 },
        { x: W * 0.1, y: H * 0.7, radius: W * 0.3, hue: 300, sat: 25, light: 8, alpha: 0.06, driftX: 0.008, driftY: 0.015 },
        { x: W * 0.85, y: H * 0.2, radius: W * 0.28, hue: 200, sat: 45, light: 10, alpha: 0.07, driftX: -0.01, driftY: -0.008 },
      ];
    }

    function initStars(n: number) {
      stars = [];
      for (let i = 0; i < n; i++) {
        const z = Math.random() * Math.max(W, H);
        stars.push({
          x: (Math.random() - 0.5) * W * 3,
          y: (Math.random() - 0.5) * H * 3,
          z,
          size: Math.random() * 2 + 0.3,
          speed: 0.2 + Math.random() * 0.8,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
          hue: Math.random() < 0.7 ? 220 + Math.random() * 40 : Math.random() < 0.5 ? 30 + Math.random() * 30 : 0,
          saturation: Math.random() * 30 + 10,
        });
      }
    }

    function spawnShootingStar() {
      const side = Math.random();
      const sx = side < 0.5 ? Math.random() * W * 0.3 : W * 0.7 + Math.random() * W * 0.3;
      const sy = Math.random() * H * 0.4;
      const angle = Math.PI * 0.2 + Math.random() * Math.PI * 0.3;
      const speed = 8 + Math.random() * 12;
      shootingStars.push({
        x: sx, y: sy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 25 + Math.random() * 30,
        tail: 60 + Math.random() * 80,
      });
    }

    initNebulae();
    initStars(300);

    function drawBackground() {
      const grad = ctx!.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#03060f");
      grad.addColorStop(0.3, "#060b18");
      grad.addColorStop(0.6, "#0a0e20");
      grad.addColorStop(1, "#040810");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);
    }

    function drawNebulae(t: number) {
      for (const n of nebulae) {
        const dx = Math.sin(t * n.driftX) * W * 0.02;
        const dy = Math.cos(t * n.driftY) * H * 0.02;
        const grad = ctx!.createRadialGradient(
          n.x + dx, n.y + dy, 0,
          n.x + dx, n.y + dy, n.radius
        );
        const breathe = 1 + Math.sin(t * 0.3 + n.x) * 0.15;
        const a = n.alpha * breathe;
        grad.addColorStop(0, `hsla(${n.hue}, ${n.sat}%, ${n.light + 8}%, ${a})`);
        grad.addColorStop(0.4, `hsla(${n.hue + 10}, ${n.sat - 5}%, ${n.light}%, ${a * 0.6})`);
        grad.addColorStop(1, `hsla(${n.hue + 20}, ${n.sat - 10}%, ${n.light - 5}%, 0)`);
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, W, H);
      }
    }

    function drawStars(t: number) {
      for (const s of stars) {
        s.z -= s.speed * 0.4;
        if (s.z <= 0) {
          s.x = (Math.random() - 0.5) * W * 4;
          s.y = (Math.random() - 0.5) * H * 4;
          s.z = Math.max(W, H) + Math.random() * Math.max(W, H);
        }
        const sc = Math.max(W, H) / Math.max(s.z, 1);
        const px = W / 2 + s.x * sc;
        const py = H / 2 + s.y * sc;
        if (px < -20 || px > W + 20 || py < -20 || py > H + 20) continue;

        const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
        const brightness = Math.min(1, (1 - s.z / (Math.max(W, H) * 2)) * 3);
        const alpha = Math.min(1, brightness * twinkle * 0.9);
        const r = s.size * Math.min(sc, 3);

        ctx!.beginPath();
        ctx!.arc(px, py, Math.max(0.4, r), 0, Math.PI * 2);
        if (s.hue > 0) {
          ctx!.fillStyle = `hsla(${s.hue}, ${s.saturation}%, ${80 + twinkle * 20}%, ${alpha})`;
        } else {
          ctx!.fillStyle = `rgba(255,255,255,${alpha})`;
        }
        ctx!.fill();

        if (r > 1.5) {
          ctx!.beginPath();
          ctx!.arc(px, py, r * 3, 0, Math.PI * 2);
          const glowAlpha = alpha * 0.08;
          ctx!.fillStyle = s.hue > 0
            ? `hsla(${s.hue}, ${s.saturation}%, 80%, ${glowAlpha})`
            : `rgba(180,200,255,${glowAlpha})`;
          ctx!.fill();
        }
      }
    }

    function drawShootingStars() {
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;

        if (ss.life >= ss.maxLife || ss.x > W + 100 || ss.y > H + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        const progress = ss.life / ss.maxLife;
        const fade = progress < 0.1 ? progress / 0.1 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        const tailLen = ss.tail * fade;

        const tailX = ss.x - (ss.vx / Math.hypot(ss.vx, ss.vy)) * tailLen;
        const tailY = ss.y - (ss.vy / Math.hypot(ss.vx, ss.vy)) * tailLen;

        const grad = ctx!.createLinearGradient(ss.x, ss.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,255,255,${fade * 0.9})`);
        grad.addColorStop(0.3, `rgba(200,220,255,${fade * 0.5})`);
        grad.addColorStop(1, `rgba(100,120,180,0)`);

        ctx!.beginPath();
        ctx!.moveTo(ss.x, ss.y);
        ctx!.lineTo(tailX, tailY);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.5;
        ctx!.lineCap = "round";
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${fade})`;
        ctx!.fill();
      }
    }

    let isVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(section);

    function loop() {
      if (!isVisible) {
        animId = requestAnimationFrame(loop);
        return;
      }

      time += 0.016;

      if (Date.now() - lastShootingStar > 2000 + Math.random() * 5000 && shootingStars.length < 2) {
        spawnShootingStar();
        lastShootingStar = Date.now();
      }

      drawBackground();
      drawNebulae(time);
      drawStars(time);
      drawShootingStars();

      animId = requestAnimationFrame(loop);
    }
    loop();

    function doDismiss() {
      localStorage.setItem(KEY, "off");
      section!.style.display = "none";
    }
    btn.addEventListener("click", doDismiss);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", fitCanvas);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cosmic-ending"
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", display: "block" }}
    >
      <canvas
        ref={canvasRef}
        id="cosmic-canvas"
        className="absolute inset-0 block"
        style={{ width: "100%", height: "100%" }}
      />
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: "40%",
          background: "linear-gradient(to bottom, hsl(var(--background)), transparent)",
        }}
      />
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10">
        <p className="text-white/30 text-sm tracking-[0.3em] font-light select-none">
          END OF PAGE
        </p>
        <button
          ref={btnRef}
          id="cosmic-dismiss"
          className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-white/40 hover:text-white/70 hover:border-white/25 transition-all cursor-pointer select-none"
        >
          不想再看
        </button>
      </div>
    </section>
  );
}
