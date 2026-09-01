import React, { useEffect, useRef } from 'react';
import nebulaBg from '../assets/images/cosmic_nebula_bg_1788113679432.jpg';

interface CosmicBackgroundProps {
  isWarping?: boolean;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ isWarping = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Star particle model
    const STAR_COUNT = 320;
    const stars: Array<{
      x: number;
      y: number;
      z: number;
      size: number;
      baseAlpha: number;
      alpha: number;
      twinkleSpeed: number;
      color: string;
    }> = [];

    const starColors = [
      '#ffffff',
      '#e0e7ff',
      '#c7d2fe',
      '#a5f3fc',
      '#fbcfe8',
      '#fef08a',
      '#ddd6fe',
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 1000 + 1,
        size: Math.random() * 1.6 + 0.4,
        baseAlpha: Math.random() * 0.7 + 0.3,
        alpha: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // Shooting stars
    const shootingStars: Array<{
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
      color: string;
    }> = [];

    const spawnShootingStar = () => {
      const colors = ['#a5f3fc', '#f472b6', '#fed7aa', '#c084fc', '#ffffff'];
      shootingStars.push({
        x: Math.random() * (width * 0.9),
        y: Math.random() * (height * 0.4),
        length: Math.random() * 90 + 60,
        speed: Math.random() * 14 + 12,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
        opacity: 1,
        active: true,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    let lastShootingStarTime = performance.now();

    // Subtle dynamic nebula lighting accents
    const nebulae = [
      { x: width * 0.2, y: height * 0.3, r: 350, color: 'rgba(124, 58, 237, 0.08)' }, // Purple
      { x: width * 0.75, y: height * 0.4, r: 420, color: 'rgba(6, 182, 212, 0.07)' }, // Cyan
      { x: width * 0.5, y: height * 0.7, r: 380, color: 'rgba(236, 72, 153, 0.06)' }, // Magenta
      { x: width * 0.85, y: height * 0.8, r: 300, color: 'rgba(245, 158, 11, 0.05)' }, // Cosmic Amber
    ];

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.03;
      mouseY = (e.clientY - height / 2) * 0.03;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Nebula Atmospheric Accent Gradients
      nebulae.forEach((neb) => {
        const grad = ctx.createRadialGradient(
          neb.x - mouseX * 0.4,
          neb.y - mouseY * 0.4,
          10,
          neb.x - mouseX * 0.4,
          neb.y - mouseY * 0.4,
          neb.r
        );
        grad.addColorStop(0, neb.color);
        grad.addColorStop(1, 'rgba(3, 3, 8, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(neb.x - mouseX * 0.4, neb.y - mouseY * 0.4, neb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw Stars
      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        if (isWarping) {
          // Warp Speed: Star streaks towards camera
          star.z -= 45;
          if (star.z <= 0) {
            star.z = 1000;
            star.x = (Math.random() - 0.5) * width * 2;
            star.y = (Math.random() - 0.5) * height * 2;
          }

          const k = 250 / star.z;
          const px = star.x * k + cx;
          const py = star.y * k + cy;

          const prevK = 250 / (star.z + 60);
          const prevPx = star.x * prevK + cx;
          const prevPy = star.y * prevK + cy;

          ctx.strokeStyle = star.color;
          ctx.lineWidth = Math.max(1, (1 - star.z / 1000) * 3.5);
          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          // Normal Cosmic Drift & Twinkle
          star.alpha += star.twinkleSpeed;
          const currentAlpha =
            star.baseAlpha + Math.sin(star.alpha) * 0.3;

          const k = 500 / star.z;
          const px = (star.x - mouseX) * k + cx;
          const py = (star.y - mouseY) * k + cy;

          if (px > 0 && px < width && py > 0 && py < height) {
            ctx.fillStyle = star.color;
            ctx.globalAlpha = Math.max(0.1, Math.min(1, currentAlpha));
            ctx.beginPath();
            ctx.arc(px, py, star.size * k * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
      });

      // 3. Shooting Stars - Spawns reliably every 5 seconds (5000ms)
      const now = performance.now();
      if (now - lastShootingStarTime >= 5000 && !isWarping) {
        spawnShootingStar();
        // Occasional twin meteor trail
        if (Math.random() > 0.6) {
          setTimeout(() => spawnShootingStar(), 400);
        }
        lastShootingStarTime = now;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        if (!s.active) continue;

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.015;

        if (s.opacity <= 0 || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
        grad.addColorStop(0.3, `rgba(244, 114, 182, ${s.opacity * 0.8})`);
        grad.addColorStop(0.7, `rgba(168, 85, 247, ${s.opacity * 0.4})`);
        grad.addColorStop(1, 'rgba(168, 85, 247, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing Starburst Head
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.shadowColor = s.color || '#f472b6';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isWarping]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#02010a]">
      {/* High-Resolution Cosmic Nebula Wallpaper - Crystal Clear Display */}
      <div className="absolute inset-0">
        <img
          src={nebulaBg}
          alt="Cosmic Nebula Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-95 transition-opacity duration-700 ease-out"
          style={{
            filter: 'brightness(0.96) contrast(1.08) saturate(1.15)',
          }}
        />
      </div>

      {/* Subtle edge vignette for UI clarity without obscuring the nebula */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02010a]/30 via-transparent to-[#02010a]/40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#02010a]/20 via-transparent to-[#02010a]/20 pointer-events-none" />

      {/* Subtle Atmospheric Cosmic Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen" />

      {/* Particle Canvas for 3D Twinkling Stars, Shooting Meteors & Warp Speed Acceleration */}
      <canvas
        id="cosmic-canvas"
        ref={canvasRef}
        className="relative z-10 w-full h-full"
      />
    </div>
  );
};
