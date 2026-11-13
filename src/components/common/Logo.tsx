import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

/** The SaveTube mark: a play button in a ring, on a rounded green square. */
export const Logo: React.FC<LogoProps> = ({ className = "", size = 48, showText = false }) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <rect width="64" height="64" rx="14" fill="#10b981" />
        <circle cx="32" cy="32" r="19" stroke="#ffffff" strokeWidth="4" />
        <path d="M27 22.5v19l16-9.5z" fill="#ffffff" />
      </svg>
      {showText && (
        <span className="font-extrabold text-xl tracking-tight text-chrome-neutral-100">
          SaveTube
        </span>
      )}
    </div>
  );
};

export default Logo;
