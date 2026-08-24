import React, { useEffect, useRef } from 'react';
import { LiveWallpaperType } from '../../types';

interface LiveWallpaperProps {
  type: LiveWallpaperType;
}

export const LiveWallpaper: React.FC<LiveWallpaperProps> = ({ type }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (type === 'none') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 380);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 780);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // ==========================================
    // 1. STARFIELD 3D WARP
    // ==========================================
    if (type === 'starfield') {
      const numStars = 180;
      const stars = Array.from({ length: numStars }, () => ({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        radius: Math.random() * 1.5 + 0.5,
        color: ['#38bdf8', '#818cf8', '#c084fc', '#ffffff'][Math.floor(Math.random() * 4)],
      }));

      const render = () => {
        ctx.fillStyle = '#050711';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        stars.forEach((star) => {
          star.z -= 2.2;
          if (star.z <= 0) {
            star.z = width;
            star.x = (Math.random() - 0.5) * width * 2;
            star.y = (Math.random() - 0.5) * height * 2;
          }

          const k = 250 / star.z;
          const px = star.x * k + cx;
          const py = star.y * k + cy;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const size = (1 - star.z / width) * 2.8;
            const alpha = 1 - star.z / width;

            ctx.beginPath();
            ctx.fillStyle = star.color;
            ctx.globalAlpha = alpha;
            ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
            ctx.fill();
          }
        });

        ctx.globalAlpha = 1.0;
        animationId = requestAnimationFrame(render);
      };

      render();
    }

    // ==========================================
    // 2. MATRIX RAIN
    // ==========================================
    else if (type === 'matrix') {
      const fontSize = 14;
      const columns = Math.floor(width / fontSize);
      const drops: number[] = Array(columns).fill(1);
      const chars = '0123456789ABCDEF日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

      const render = () => {
        ctx.fillStyle = 'rgba(5, 7, 10, 0.12)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Glowing tip
          ctx.fillStyle = '#bbf7d0';
          ctx.fillText(text, x, y);

          // Body green
          ctx.fillStyle = '#22c55e';
          ctx.fillText(text, x, y - fontSize);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        animationId = requestAnimationFrame(render);
      };

      render();
    }

    // ==========================================
    // 3. QUANTUM WAVES
    // ==========================================
    else if (type === 'waves') {
      let step = 0;
      const numLines = 5;

      const render = () => {
        ctx.fillStyle = '#060d1a';
        ctx.fillRect(0, 0, width, height);

        step += 0.015;

        for (let l = 0; l < numLines; l++) {
          ctx.beginPath();
          const gradient = ctx.createLinearGradient(0, 0, width, height);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(0.5, '#6366f1');
          gradient.addColorStop(1, '#ec4899');
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2.0;
          ctx.globalAlpha = 0.45;

          const baseHeight = (height / (numLines + 1)) * (l + 1);

          for (let x = 0; x <= width; x += 10) {
            const angle = (x / width) * Math.PI * 4 + step + l * 0.8;
            const y = baseHeight + Math.sin(angle) * 35 + Math.cos(angle * 0.5) * 20;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }

        ctx.globalAlpha = 1.0;
        animationId = requestAnimationFrame(render);
      };

      render();
    }

    // ==========================================
    // 4. FLOATING ORBS
    // ==========================================
    else if (type === 'orbs') {
      const orbs = [
        { x: width * 0.3, y: height * 0.3, vx: 0.6, vy: 0.4, r: 120, color: '#38bdf8' },
        { x: width * 0.7, y: height * 0.6, vx: -0.5, vy: 0.7, r: 140, color: '#818cf8' },
        { x: width * 0.5, y: height * 0.8, vx: 0.4, vy: -0.5, r: 100, color: '#f43f5e' },
        { x: width * 0.2, y: height * 0.7, vx: -0.6, vy: -0.3, r: 110, color: '#10b981' },
      ];

      const render = () => {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        orbs.forEach((orb) => {
          orb.x += orb.vx;
          orb.y += orb.vy;

          if (orb.x - orb.r < 0 || orb.x + orb.r > width) orb.vx *= -1;
          if (orb.y - orb.r < 0 || orb.y + orb.r > height) orb.vy *= -1;

          const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
          grad.addColorStop(0, orb.color);
          grad.addColorStop(1, 'transparent');

          ctx.globalAlpha = 0.25;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalAlpha = 1.0;
        animationId = requestAnimationFrame(render);
      };

      render();
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type]);

  if (type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
    />
  );
};
