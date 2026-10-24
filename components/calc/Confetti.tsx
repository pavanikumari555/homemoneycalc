"use client";

// Tiny confetti burst (no library). Call fireConfetti() at a "you did it" moment.
// Respects reduced-motion. DOM pieces auto-remove after the animation.
const COLORS = ["#3a8557", "#5aa074", "#f7b733", "#ffd166", "#8bc09e", "#e89b0c"];

export function fireConfetti(count = 90) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:60";
  document.body.appendChild(layer);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    const size = 6 + Math.random() * 6;
    const startX = 50 + (Math.random() - 0.5) * 30; // vw, burst from center
    const dx = (Math.random() - 0.5) * 90; // vw drift
    const rot = Math.random() * 720 - 360;
    const dur = 1400 + Math.random() * 1200;
    piece.style.cssText = `position:absolute;top:35vh;left:${startX}vw;width:${size}px;height:${size * 0.45}px;background:${
      COLORS[i % COLORS.length]
    };border-radius:2px;opacity:1`;
    layer.appendChild(piece);
    piece.animate(
      [
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx * 0.5}vw,-${15 + Math.random() * 20}vh) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${dx}vw,70vh) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: dur, easing: "cubic-bezier(.2,.6,.3,1)", fill: "forwards" }
    );
  }
  window.setTimeout(() => layer.remove(), 2800);
}
