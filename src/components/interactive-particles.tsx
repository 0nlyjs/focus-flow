"use client";

import { useEffect, useRef } from "react";

export default function InteractiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    // Colors matching the FocusFlow aesthetic: purple, gold, soft lavender, and cream yellow glow
    const colors = [
      "rgba(184, 141, 21, 0.28)",  // #B88D15 (Gold)
      "rgba(123, 82, 171, 0.28)",  // #7B52AB (Purple)
      "rgba(234, 219, 247, 0.28)", // #EADBF7 (Soft lavender)
      "rgba(250, 246, 227, 0.35)"  // #FAF6E3 (Cream yellow glow)
    ];

    let targetScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let currentScrollY = targetScrollY;
    let lastScrollY = targetScrollY;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      // Dynamic particle count depending on viewport area
      const numberOfParticles = Math.min(80, Math.floor((canvas.width * canvas.height) / 22000));
      for (let i = 0; i < numberOfParticles; i++) {
        const radius = Math.random() * 4.5 + 2;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      // Smooth scroll tracking
      currentScrollY += (targetScrollY - currentScrollY) * 0.12;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Draw faint connections between close particles
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(123, 82, 171, ${0.18 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        // Apply normal drift velocity + parallax scroll displacement (upward when scrolling down, downward when scrolling up)
        p.x += p.vx;
        p.y += p.vy - scrollDelta * (p.radius * 0.15);

        // Infinite wrapping to handle both normal movement and scroll displacements
        const buffer = p.radius + 15;
        if (p.y < -buffer) {
          p.y = canvas.height + buffer;
        } else if (p.y > canvas.height + buffer) {
          p.y = -buffer;
        }
        if (p.x < -buffer) {
          p.x = canvas.width + buffer;
        } else if (p.x > canvas.width + buffer) {
          p.x = -buffer;
        }

        // Mouse repelling physics
        if (mouse.x !== -1000 && mouse.y !== -1000) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const forceRadius = 140;

          if (dist < forceRadius) {
            const force = (forceRadius - dist) / forceRadius;
            const directionX = dx / (dist || 1);
            const directionY = dy / (dist || 1);
            const repulsionStrength = 1.4;

            p.x += directionX * force * repulsionStrength;
            p.y += directionY * force * repulsionStrength;
          }
        }

        // Render particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resizeCanvas);
    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    resizeCanvas();
    draw();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}
