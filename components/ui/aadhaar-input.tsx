"use client"

import React, { useState, useRef, useCallback } from "react";
import { cn } from "./utils";
import { Check, AlertCircle, CreditCard } from "lucide-react";

// ─── Verhoeff Algorithm ───────────────────────────────────────────────────────

const D: number[][] = [
  [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];

const P: number[][] = [
  [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
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
  if (!/^[2-9]/.test(digits)) return false;
  if (/^(\d)\1{11}$/.test(digits)) return false;
  if (!verhoeff(digits)) return false;
  return true;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatAadhaar = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(" ");
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface AadhaarInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  label?: string;
  error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AadhaarInput: React.FC<AadhaarInputProps> = ({
  value: controlledValue,
  onChange,
  className,
  label = "Aadhaar Number",
  error,
}) => {
  const [internalValue, setInternalValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const raw = controlledValue ?? internalValue;
  const digits = raw.replace(/\D/g, "");
  const formatted = formatAadhaar(raw);

  const complete = digits.length === 12;
  const valid = isValidAadhaar(digits);

  const showError = complete && !valid;
  const hasExternalError = !!error;

  const progress = Math.min((digits.length / 12) * 100, 100);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const digitsOnly = input.replace(/\D/g, "").slice(0, 12);
      const newFormatted = formatAadhaar(digitsOnly);
      if (onChange) onChange(digitsOnly);
      else setInternalValue(digitsOnly);

      requestAnimationFrame(() => {
        if (inputRef.current) {
          const cursorPos = newFormatted.length;
          inputRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      });
    },
    [onChange]
  );

  const borderClass = focused
    ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
    : complete && valid
    ? "border-green-500"
    : showError || hasExternalError
    ? "border-destructive"
    : "border-input hover:border-muted-foreground/40";

  const progressClass = complete && valid
    ? "bg-green-500"
    : showError
    ? "bg-destructive"
    : "bg-primary";

  let helperText: string;
  let helperClass: string;

  if (hasExternalError && error) {
    helperText = error;
    helperClass = "text-destructive";
  } else if (showError) {
    helperText = "Invalid Aadhaar number";
    helperClass = "text-destructive";
  } else if (digits.length === 0) {
    helperText = "Enter your 12-digit Aadhaar number";
    helperClass = "text-muted-foreground";
  } else if (complete && valid) {
    helperText = "Valid Aadhaar number";
    helperClass = "text-green-500";
  } else {
    helperText = `${digits.length}/12 digits`;
    helperClass = "text-muted-foreground";
  }

  return (
    <div className={cn("w-full max-w-s ", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative flex items-center rounded-lg border-2 bg-card px-3 py-3 transition-all duration-200 cursor-text",
          borderClass
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <CreditCard
          className={cn(
            "mr-3 h-5 w-5 shrink-0 transition-colors duration-200",
            focused ? "text-primary" : "text-muted-foreground"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0000 0000 0000"
          value={formatted}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-lg font-mono tracking-[0.15em] text-foreground placeholder:text-muted-foreground/50 outline-none"
          maxLength={14}
          aria-label="Aadhaar Number"
          aria-invalid={showError || hasExternalError}
        />

        <div className="ml-2 shrink-0">
          {complete && valid ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
              <Check className="h-3.5 w-3.5" />
            </div>
          ) : showError || hasExternalError ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : null}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-out", progressClass)}
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
