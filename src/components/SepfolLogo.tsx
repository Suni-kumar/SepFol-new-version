import React, { useEffect, useRef } from 'react';

interface SepfolLogoProps {
  className?: string;
  glowIntensity?: number;
  theme?: 'midnight' | 'deepocean' | 'darkslate';
  width?: number;
  height?: number;
}

export const SepfolLogo: React.FC<SepfolLogoProps> = ({
  className = '',
  glowIntensity = 0.8,
  theme = 'midnight',
  width = 512,
  height = 512,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Background Gradient
    let bgGrad;
    if (theme === 'midnight') {
        bgGrad = ctx.createRadialGradient(w * 0.4, h * 0.3, w * 0.1, w * 0.5, h * 0.5, w * 0.75);
        bgGrad.addColorStop(0, '#0f243d');
        bgGrad.addColorStop(0.5, '#070f1e');
        bgGrad.addColorStop(1, '#02060d');
    } else if (theme === 'deepocean') {
        bgGrad = ctx.createRadialGradient(w * 0.3, h * 0.3, w * 0.05, w * 0.5, h * 0.5, w * 0.7);
        bgGrad.addColorStop(0, '#1e3a8a');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
    } else {
        bgGrad = ctx.createRadialGradient(w * 0.4, h * 0.3, w * 0.1, w * 0.5, h * 0.5, w * 0.7);
        bgGrad.addColorStop(0, '#1e293b');
        bgGrad.addColorStop(0.6, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Tech Grid Subtle Overlay
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.03 * glowIntensity})`;
    ctx.lineWidth = 1;
    const step = 32;
    for(let x=0; x<=w; x+=step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for(let y=0; y<=h; y+=step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // 2. Ambient Glow Behind 'S' Icon
    const glowGrad = ctx.createRadialGradient(256, 256, 20, 256, 256, 180);
    glowGrad.addColorStop(0, `rgba(56, 189, 248, ${0.35 * glowIntensity})`);
    glowGrad.addColorStop(0.5, `rgba(37, 99, 235, ${0.15 * glowIntensity})`);
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // 3. Draw 3D Glassmorphic 'S' Logo Mark
    ctx.save();
    ctx.translate(256, 256); // Center origin

    // Outer Shadow for 3D Floating Depth
    ctx.shadowColor = 'rgba(0, 5, 15, 0.75)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;

    // --- GLASS PATH S STRUCTURE ---
    // Draw Main Glass Body S Curve
    const drawSPath = () => {
        ctx.beginPath();
        // Top loop start
        ctx.moveTo(70, -110);
        ctx.bezierCurveTo(70, -165, -60, -165, -60, -100);
        ctx.bezierCurveTo(-60, -50, 65, -40, 65, 45);
        ctx.bezierCurveTo(65, 155, -75, 155, -75, 100);
        ctx.bezierCurveTo(-75, 80, -55, 75, -40, 95);
        ctx.bezierCurveTo(-30, 110, 25, 115, 25, 45);
        ctx.bezierCurveTo(25, -45, -100, -35, -100, -105);
        ctx.bezierCurveTo(-100, -195, 70, -195, 70, -110);
        ctx.closePath();
    };

    // 3A. Translucent Glass Tint Fill
    drawSPath();
    const glassFill = ctx.createLinearGradient(-100, -150, 100, 150);
    glassFill.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    glassFill.addColorStop(0.4, 'rgba(14, 165, 233, 0.15)');
    glassFill.addColorStop(0.8, 'rgba(30, 58, 138, 0.4)');
    glassFill.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
    ctx.fillStyle = glassFill;
    ctx.fill();

    ctx.shadowColor = 'transparent'; // Reset shadow

    // 3B. Refraction Light Highlights (Glass Rim Strokes)
    const edgeGrad = ctx.createLinearGradient(-100, -150, 100, 150);
    edgeGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * glowIntensity})`);
    edgeGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.5)');
    edgeGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.2)');
    edgeGrad.addColorStop(1, `rgba(255, 255, 255, ${0.8 * glowIntensity})`);

    ctx.strokeStyle = edgeGrad;
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3C. Inner Glass Caustic Highlight Lines
    ctx.beginPath();
    ctx.moveTo(50, -135);
    ctx.bezierCurveTo(50, -155, -45, -155, -45, -100);
    ctx.bezierCurveTo(-45, -65, 45, -55, 45, 45);
    ctx.strokeStyle = `rgba(186, 230, 253, ${0.7 * glowIntensity})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3D. Bottom Refraction Accent
    ctx.beginPath();
    ctx.moveTo(45, 45);
    ctx.bezierCurveTo(45, 125, -55, 125, -55, 95);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3E. Floating Light Flares / Dots for Digital Vibe
    const drawSparkle = (x: number, y: number, r: number) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(56, 189, 248, 1)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowColor = 'transparent';
    };

    drawSparkle(62, -132, 2.5);
    drawSparkle(-48, -105, 2);
    drawSparkle(42, 45, 2.5);

    ctx.restore();
  }, [glowIntensity, theme]);

  return (
    <canvas 
      ref={canvasRef} 
      width={512} 
      height={512} 
      className={`object-contain ${className}`}
      style={{ width, height }}
    />
  );
};
