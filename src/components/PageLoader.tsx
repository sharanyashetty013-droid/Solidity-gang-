import React, { useEffect, useState } from 'react';

interface PageLoaderProps {
  onComplete: () => void;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setFading(true);
          setTimeout(() => {
            onComplete();
          }, 200);
          return 100;
        }
        return p + 5;
      });
    }, 28);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0F19] transition-opacity duration-300 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center text-center p-8">
        {/* Animated self-drawing SVG house logo */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-6">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-[#10B981]"
          >
            {/* House path with self-drawing dash animation */}
            <path
              d="M24 6L7 19.5C6.37 20 6 20.76 6 21.57V39C6 40.66 7.34 42 9 42H39C40.66 42 42 40.66 42 39V21.57C42 20.76 41.63 20 41 19.5L24 6Z"
              stroke="#10B981"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 140,
                strokeDashoffset: 140 - (progress / 100) * 140,
                transition: 'stroke-dashoffset 0.05s linear',
              }}
            />
            {/* Keyhole circle */}
            <circle
              cx="24"
              cy="23.5"
              r="3.75"
              fill={progress > 60 ? '#10B981' : 'none'}
              stroke="#10B981"
              strokeWidth="2"
              className="transition-colors duration-200"
            />
            {/* Keyhole slot */}
            <path
              d="M22 25.5L20.5 33.5C20.4 34.1 20.8 34.6 21.4 34.6H26.6C27.2 34.6 27.6 34.1 27.5 33.5L26 25.5H22Z"
              fill={progress > 75 ? '#10B981' : 'none'}
              stroke="#10B981"
              strokeWidth="1.5"
              className="transition-colors duration-200"
            />
          </svg>
          {/* Central glow when keyhole fills */}
          {progress > 80 && (
            <div className="absolute inset-0 bg-[#10B981]/25 rounded-full blur-xl pointer-events-none" />
          )}
        </div>

        {/* Wordmark */}
        <h2 className="font-display font-bold text-2xl text-white lowercase tracking-tight">
          walls don't lie
        </h2>

        {/* Progress line */}
        <div className="w-36 h-1 bg-zinc-800 rounded-full mt-4 overflow-hidden border border-zinc-700/50">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
