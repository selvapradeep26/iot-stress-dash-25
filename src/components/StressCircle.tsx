import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface StressCircleProps {
  value: number; // Raw GSR value from ThingSpeak
  baseline?: number; // Baseline for "relaxed" level
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

const StressCircle = ({
  value,
  baseline = 2506,
  size = "lg",
  animate = true,
  className,
}: StressCircleProps) => {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  // --- Handle value computation and disconnected logic ---
  const { percent, level, color, isDisconnected } = useMemo(() => {
    // ✅ If no signal (ThingSpeak or hardware disconnected)
    if (value === 0 || value === null || value === undefined) {
      return {
        percent: 0,
        level: "⚠️ Disconnected",
        color: "#9ca3af", // gray-400
        isDisconnected: true,
      };
    }

    const diff = baseline - value;

    // Map deviation to stress percent (clamped 0–100)
    let stressPercent = 0;
    if (diff > 0) stressPercent = Math.min(100, (diff / baseline) * 100);
    else stressPercent = 0;

    let level = "🟢 Relaxed";
    let color = "hsl(var(--stress-low))";

    if (stressPercent > 70) {
      level = "🔴 High Stress";
      color = "hsl(var(--stress-high))";
    } else if (stressPercent > 40) {
      level = "🟡 Moderate Stress";
      color = "hsl(var(--stress-medium))";
    }

    return { percent: Math.round(stressPercent), level, color, isDisconnected: false };
  }, [value, baseline]);

  // --- Animate progress ---
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimatedPercent(percent), 150);
      return () => clearTimeout(timer);
    } else {
      setAnimatedPercent(percent);
    }
  }, [percent, animate]);

  // --- Sizes ---
  const getSize = (s: string) => {
    switch (s) {
      case "sm": return { width: 120, height: 120, strokeWidth: 8, fontSize: "text-xl" };
      case "md": return { width: 160, height: 160, strokeWidth: 10, fontSize: "text-2xl" };
      case "lg": return { width: 200, height: 200, strokeWidth: 12, fontSize: "text-4xl" };
      default: return { width: 200, height: 200, strokeWidth: 12, fontSize: "text-4xl" };
    }
  };

  const { width, height, strokeWidth, fontSize } = getSize(size);
  const radius = (Math.min(width, height) - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercent / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <svg width={width} height={height} className="transform -rotate-90">
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
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-1000 ease-out", {
              "opacity-50": isDisconnected,
            })}
          />
        </svg>

        {/* % Value text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isDisconnected ? (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <span className="text-3xl">⚠️</span>
              <span className="text-sm font-medium mt-1">No Data</span>
            </div>
          ) : (
            <span className={cn("font-bold text-foreground", fontSize)}>
              {animatedPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Level text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">Level:</p>
        <p className="font-semibold" style={{ color }}>
          {level}
        </p>
      </div>
    </div>
  );
};

export default StressCircle;
