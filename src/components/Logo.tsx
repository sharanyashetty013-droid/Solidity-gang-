import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-24 h-24 md:w-32 md:h-32',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* House outline with keyhole in center - obsidian with emerald keyhole */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#0F172A]"
        >
          {/* Rounded house contour */}
          <path
            d="M24 6L7 19.5C6.37 20 6 20.76 6 21.57V39C6 40.66 7.34 42 9 42H39C40.66 42 42 40.66 42 39V21.57C42 20.76 41.63 20 41 19.5L24 6Z"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Keyhole: circular top + tapered trapezoid bottom in emerald */}
          <circle cx="24" cy="23.5" r="3.75" fill="#10B981" />
          <path
            d="M22 25.5L20.5 33.5C20.4 34.1 20.8 34.6 21.4 34.6H26.6C27.2 34.6 27.6 34.1 27.5 33.5L26 25.5H22Z"
            fill="#10B981"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={`font-display font-bold tracking-tight text-[#111111] lowercase select-none ${textSizes[size]}`}
        >
          walls don't lie
        </span>
      )}
    </div>
  );
};
