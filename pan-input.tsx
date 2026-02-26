import React, { useState, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Segment {
  label: string;
  done: boolean;
  valid: boolean;
}

interface PanCardInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onValid?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

// ─── Validation utilities ────────────────────────────────────────────────────

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const sanitize = (input: string): string =>
  input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

const format = (cleaned: string): string => {
  if (cleaned.length <= 5) return cleaned;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9)}`;
};

const isValid = (cleaned: string): boolean =>
  cleaned.length === 10 && PAN_REGEX.test(cleaned);

const getSegments = (cleaned: string): Segment[] => [
  {
    label: "Letters",
    done: cleaned.length >= 5,
    valid: cleaned.length < 5 || /^[A-Z]{5}$/.test(cleaned.slice(0, 5)),
  },
  {
    label: "Digits",
    done: cleaned.length >= 9,
    valid:
      cleaned.length < 6 ||
      /^[0-9]{1,4}$/.test(cleaned.slice(5, Math.min(9, cleaned.length))),
  },
  {
    label: "Check",
    done: cleaned.length === 10,
    valid: cleaned.length < 10 || /^[A-Z]$/.test(cleaned[9]),
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

const PanCardInput: React.FC<PanCardInputProps> = ({
  value: controlledValue,
  onChange,
  onValid,
  className = "",
  label = "PAN Card Number",
  error,
}) => {
  const [internal, setInternal] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const raw = controlledValue !== undefined ? controlledValue : internal;
  const cleaned = sanitize(raw);
  const displayed = format(cleaned);
  const valid = isValid(cleaned);
  const segments = getSegments(cleaned);
  const showError = !!error || (!focused && cleaned.length > 0 && !valid);

  const barClass = (seg: Segment): string => {
    if (!seg.done) return "bg-gray-200";
    if (!seg.valid) return "bg-red-400";
    if (valid) return "bg-green-500";
    return "bg-blue-500";
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = sanitize(e.target.value);

      if (onChange) onChange(next);
      else setInternal(next);

      if (isValid(next) && onValid) onValid(next);

      requestAnimationFrame(() => {
        if (inputRef.current) {
          const pos = format(next).length;
          inputRef.current.setSelectionRange(pos, pos);
        }
      });
    },
    [onChange, onValid]
  );

  const borderClass = focused
    ? "border-blue-500 ring-2 ring-blue-100"
    : valid
    ? "border-green-500 ring-2 ring-green-100"
    : showError
    ? "border-red-400 ring-2 ring-red-100"
    : "border-gray-200 hover:border-gray-400";

  const helperText = (): { text: string; cls: string } => {
    if (showError && error) return { text: error, cls: "text-red-500" };
    if (cleaned.length === 0)
      return { text: "Format: ABCDE1234F", cls: "text-gray-400" };
    if (valid)
      return { text: "✓ Valid PAN number", cls: "text-green-600 font-medium" };
    const badSeg = segments.find((s) => s.done && !s.valid);
    if (badSeg)
      return {
        text: `Invalid characters in ${badSeg.label} section`,
        cls: "text-red-500",
      };
    return { text: `${cleaned.length}/10 characters`, cls: "text-gray-400" };
  };

  const helper = helperText();

  return (
    <div className={`w-full max-w-sm font-sans ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
          {label}
        </label>
      )}

      <div
        className={`relative flex items-center rounded-xl border-2 bg-white px-4 py-3 cursor-text transition-all duration-200 ${borderClass}`}
        onClick={() => inputRef.current?.focus()}
      >
        <svg
          className={`mr-3 h-5 w-5 shrink-0 transition-colors duration-200 ${
            focused ? "text-blue-500" : "text-gray-400"
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="ABCDE 1234 F"
          value={displayed}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-lg font-mono tracking-widest text-gray-800 placeholder-gray-300 outline-none uppercase"
          maxLength={12}
          aria-label="PAN Card Number"
          aria-invalid={showError}
          aria-describedby="pan-helper"
        />

        <div className="ml-2 shrink-0">
          {valid ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white pan-bounce">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          ) : showError ? (
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : null}
        </div>
      </div>

      {/* Segment progress bars */}
      <div className="mt-2.5 flex gap-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex-1">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${barClass(seg)}`}
            />
            <span className="block mt-1 text-[10px] text-gray-400 text-center select-none">
              {seg.label}
            </span>
          </div>
        ))}
      </div>

      <p id="pan-helper" className={`mt-1 text-xs ${helper.cls}`}>
        {helper.text}
      </p>

      <style>{`
        @keyframes pan-bounce-in {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.2); }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        .pan-bounce { animation: pan-bounce-in 0.4s ease forwards; }
      `}</style>
    </div>
  );
};

export default PanCardInput;
