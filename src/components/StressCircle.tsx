import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StressCircleProps {
  value: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

const StressCircle = ({ value, size = "lg", animate = true, className }: StressCircleProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(value);
    }
  }, [value, animate]);

  const getStressLevel = (value: number) => {
    if (value <= 30) return { level: "Low", color: "hsl(var(--stress-low))" };
    if (value <= 60) return { level: "Medium", color: "hsl(var(--stress-medium))" };
    if (value <= 80) return { level: "High", color: "hsl(var(--stress-high))" };
    return { level: "Critical", color: "hsl(var(--stress-critical))" };
  };

  const getSize = (size: string) => {
    switch (size) {
      case "sm": return { width: 120, height: 120, strokeWidth: 8, fontSize: "text-xl" };
      case "md": return { width: 160, height: 160, strokeWidth: 10, fontSize: "text-2xl" };
      case "lg": return { width: 200, height: 200, strokeWidth: 12, fontSize: "text-4xl" };
      default: return { width: 200, height: 200, strokeWidth: 12, fontSize: "text-4xl" };
    }
  };

  const { level, color } = getStressLevel(value);
  const { width, height, strokeWidth, fontSize } = getSize(size);
  const radius = (Math.min(width, height) - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <svg
          width={width}
          height={height}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.3))"
            }}
          />
        </svg>
        {/* Value text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold text-foreground", fontSize)}>
            {Math.round(animatedValue)}
          </span>
        </div>
      </div>
      {/* Level indicator */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">Level:</p>
        <p className="font-semibold" style={{ color }}>{level}</p>
      </div>
    </div>
  );
};

export default StressCircle;