import { useEffect, useRef } from "react";

interface AnimatedVisualizationProps {
  stage: "source" | "diligence" | "track";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  noiseOffset: number;
  baseY: number;
}

// Simple Perlin-like noise implementation
class SimplexNoise {
  private grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];
  private p: number[] = [];
  private perm: number[] = [];

  constructor(seed = 0) {
    // Initialize permutation array
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(this.seededRandom(seed + i) * 256);
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  private dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  public noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const a = this.perm[X] + Y;
    const aa = this.perm[a];
    const ab = this.perm[a + 1];
    const b = this.perm[X + 1] + Y;
    const ba = this.perm[b];
    const bb = this.perm[b + 1];
    
    const grad1 = this.grad3[aa % 12];
    const grad2 = this.grad3[ba % 12];
    const grad3 = this.grad3[ab % 12];
    const grad4 = this.grad3[bb % 12];
    
    const x1 = this.lerp(
      this.dot(grad1, x, y),
      this.dot(grad2, x - 1, y),
      u
    );
    const x2 = this.lerp(
      this.dot(grad3, x, y - 1),
      this.dot(grad4, x - 1, y - 1),
      u
    );
    
    return (this.lerp(x1, x2, v) + 1) / 2;
  }
}

export const AnimatedVisualization = ({ stage }: AnimatedVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const noiseRef = useRef<SimplexNoise>(new SimplexNoise(Math.random() * 1000));
  const timeRef = useRef<number>(0);

  // Stage-specific configurations
  const stageConfig = {
    source: {
      particleCount: 180,
      sizeMin: 3,
      sizeMax: 8,
      speedMin: 0.5,
      speedMax: 1.5,
      colorWeights: { cyan: 0.6, yellow: 0.3, pink: 0.1 },
      noiseScale: 0.003,
      noiseStrength: 40,
    },
    diligence: {
      particleCount: 280,
      sizeMin: 4,
      sizeMax: 12,
      speedMin: 0.8,
      speedMax: 2.0,
      colorWeights: { cyan: 0.33, yellow: 0.34, pink: 0.33 },
      noiseScale: 0.004,
      noiseStrength: 60,
    },
    track: {
      particleCount: 70,
      sizeMin: 5,
      sizeMax: 15,
      speedMin: 0.3,
      speedMax: 1.0,
      colorWeights: { cyan: 0.1, yellow: 0.3, pink: 0.6 },
      noiseScale: 0.002,
      noiseStrength: 30,
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const config = stageConfig[stage];
    const rect = canvas.getBoundingClientRect();

    // Color palette - Dark Green to Bright Green gradient
    const getColorForWeight = (): string => {
      const rand = Math.random();
      const weights = config.colorWeights;
      
      if (rand < weights.cyan) {
        // Dark forest green
        return `rgba(34, 139, 34, ${0.7 + Math.random() * 0.3})`;
      } else if (rand < weights.cyan + weights.yellow) {
        // Medium green
        return `rgba(50, 205, 50, ${0.7 + Math.random() * 0.3})`;
      } else {
        // Bright lime green
        return `rgba(144, 238, 144, ${0.7 + Math.random() * 0.3})`;
      }
    };

    // Initialize particles
    const initParticle = (x?: number): Particle => {
      const startX = x !== undefined ? x : Math.random() * rect.width;
      const baseY = Math.random() * rect.height;
      
      return {
        x: startX,
        y: baseY,
        baseY,
        vx: config.speedMin + Math.random() * (config.speedMax - config.speedMin),
        vy: 0,
        size: config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
        color: getColorForWeight(),
        opacity: 0,
        noiseOffset: Math.random() * 1000,
      };
    };

    // Create initial particles spread across canvas
    particlesRef.current = Array.from({ length: config.particleCount }, () => 
      initParticle(Math.random() * rect.width)
    );

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      timeRef.current += 0.01;

      particlesRef.current.forEach((particle, i) => {
        // Move particle horizontally (left to right)
        particle.x += particle.vx;

        // Apply Perlin noise for organic vertical movement
        const noiseValue = noiseRef.current.noise2D(
          (particle.x + particle.noiseOffset) * config.noiseScale,
          timeRef.current
        );
        particle.y = particle.baseY + (noiseValue - 0.5) * config.noiseStrength;

        // Fade in when spawning
        if (particle.x < 50) {
          particle.opacity = particle.x / 50;
        } 
        // Fade out near right edge
        else if (particle.x > rect.width - 50) {
          particle.opacity = (rect.width - particle.x) / 50;
        } 
        // Full opacity in middle
        else {
          particle.opacity = 0.8 + Math.sin(timeRef.current + i * 0.1) * 0.2;
        }

        // Respawn particle on left when it exits right
        if (particle.x > rect.width + 20) {
          const newParticle = initParticle(-10);
          particlesRef.current[i] = newParticle;
          return;
        }

        // Draw particle with glow effect
        ctx.save();
        
        // Parse color and apply opacity
        const colorMatch = particle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (colorMatch) {
          const r = colorMatch[1];
          const g = colorMatch[2];
          const b = colorMatch[3];
          const finalColor = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`;
          
          // Outer glow
          ctx.shadowBlur = particle.size * 3;
          ctx.shadowColor = finalColor;
          ctx.fillStyle = finalColor;
          
          // Draw particle as circle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Inner bright core
          ctx.shadowBlur = particle.size;
          const coreColor = `rgba(${r}, ${g}, ${b}, ${Math.min(particle.opacity * 1.5, 1)})`;
          ctx.fillStyle = coreColor;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stage]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
};
