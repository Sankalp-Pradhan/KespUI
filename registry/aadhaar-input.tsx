"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

import { Check, AlertCircle, CreditCard } from "lucide-react";
import { cn } from "./utils";

// ─── Verhoeff Algorithm ───────────────────────────────────────────────────────

const D: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const P: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function verhoeff(num: string): boolean {
  let c = 0;
  const arr = num.split("").reverse().map(Number);
  for (let i = 0; i < arr.length; i++) c = D[c][P[i % 8][arr[i]]];
  return c === 0;
}

// ─── Full Validation ──────────────────────────────────────────────────────────

function isValidAadhaar(digits: string): boolean {
  if (digits.length !== 12) return false;
  if (!/^\d+$/.test(digits)) return false;
  if (!/^[2-9]/.test(digits)) return false; // must not start with 0 or 1
  if (/^(\d)\1{11}$/.test(digits)) return false; // no repeating sequence
  if (!verhoeff(digits)) return false; // Verhoeff checksum
  return true;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatAadhaar = (raw: string, separator = " "): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(separator);
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AadhaarInputProps {
  value?: string;
  onChange?: (digits: string) => void;
  onComplete?: (digits: string) => void;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  separator?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AadhaarInput: React.FC<AadhaarInputProps> = ({
  value: controlledValue,
  onChange,
  onComplete,
  error = false,
  errorMessage,
  disabled = false,
  className,
  label = "Aadhaar Number",
  placeholder = "0000 0000 0000",
  separator = " ",
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const raw = controlledValue !== undefined ? controlledValue : internalValue;
  const digits = raw.replace(/\D/g, "");
  const formatted = formatAadhaar(raw, separator);

  const complete = digits.length === 12;
  const valid = isValidAadhaar(digits);

  // Show error state only once all 12 digits are entered and they fail validation
  const showInternalError = complete && !valid;
  const hasExternalError = error || !!errorMessage;

  const progress = Math.min((digits.length / 12) * 100, 100);

  // Fire onComplete when 12 digits are entered
  useEffect(() => {
    if (complete && !hasCompletedOnce && onComplete) {
      onComplete(digits);
      setHasCompletedOnce(true);
    }
    if (!complete && hasCompletedOnce) {
      setHasCompletedOnce(false);
    }
  }, [complete, digits, onComplete, hasCompletedOnce]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const input = e.target.value;
      const digitsOnly = input.replace(/\D/g, "").slice(0, 12);

      if (onChange) onChange(digitsOnly);
      else setInternalValue(digitsOnly);

      requestAnimationFrame(() => {
        if (inputRef.current) {
          const newFormatted = formatAadhaar(digitsOnly, separator);
          const cursorPos = newFormatted.length;
          inputRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      });
    },
    [onChange, disabled, separator],
  );

  // Border color logic
  const borderClass = disabled
    ? "border-[#E5E7EB] bg-[#F9FAFB]"
    : focused
      ? "border-[#2563EB] shadow-[0_0_0_3px_rgba(37,99,235,0.1)]"
      : complete && valid && !hasExternalError
        ? "border-[#10B981]"
        : showInternalError || hasExternalError
          ? "border-[#EF4444]"
          : "border-[#E5E7EB] hover:border-[#9CA3AF]";

  // Progress bar color
  const progressClass =
    complete && valid && !hasExternalError
      ? "bg-[#10B981]"
      : showInternalError || hasExternalError
        ? "bg-[#EF4444]"
        : "bg-[#2563EB]";

  // Helper text
  let helperText: string;
  let helperClass: string;

  if (hasExternalError && errorMessage) {
    helperText = errorMessage;
    helperClass = "text-[#EF4444]";
  } else if (showInternalError && !hasExternalError) {
    helperText = "Invalid Aadhaar number";
    helperClass = "text-[#EF4444]";
  } else if (digits.length === 0) {
    helperText = "Enter your 12-digit Aadhaar number";
    helperClass = "text-[#6B7280]";
  } else if (complete && valid && !hasExternalError) {
    helperText = "Valid Aadhaar number";
    helperClass = "text-[#10B981]";
  } else {
    helperText = `${digits.length}/12 digits`;
    helperClass = "text-[#6B7280]";
  }

  return (
    <div className={cn("w-full max-w-md", className)}>
      {label && (
        <label className="block text-sm font-medium text-[#111827] mb-1.5">
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative flex items-center rounded-lg border-2 bg-white px-3 py-3 transition-all duration-200",
          disabled ? "cursor-not-allowed" : "cursor-text",
          borderClass,
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        <CreditCard
          className={cn(
            "mr-3 h-5 w-5 shrink-0 transition-colors duration-200",
            disabled
              ? "text-[#9CA3AF]"
              : focused
                ? "text-[#2563EB]"
                : "text-[#6B7280]",
          )}
        />
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          value={formatted}
          onChange={handleChange}
          onFocus={() => !disabled && setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={cn(
            "flex-1 bg-transparent text-lg font-mono tracking-[0.15em] text-[#111827] placeholder:text-[#9CA3AF] outline-none",
            disabled && "cursor-not-allowed text-[#9CA3AF]",
          )}
          maxLength={14 + (separator.length - 1) * 2}
          aria-label="Aadhaar Number"
          aria-invalid={showInternalError || hasExternalError}
          aria-disabled={disabled}
        />

        <div className="ml-2 shrink-0">
          {complete && valid && !hasExternalError && !disabled ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10B981] text-white">
              <Check className="h-3.5 w-3.5" />
            </div>
          ) : (showInternalError || hasExternalError) && !disabled ? (
            <AlertCircle className="h-5 w-5 text-[#EF4444]" />
          ) : null}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            progressClass,
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Helper text */}
      <div className="mt-1.5 text-xs">
        <span className={helperClass}>{helperText}</span>
      </div>
    </div>
  );
};

export default AadhaarInput;