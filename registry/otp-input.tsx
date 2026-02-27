"use client"

import { useState, useRef, useCallback, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { Timer, RotateCcw, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OtpInputProps {
  length?: 4 | 6;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  resendCooldown?: number;
  onResend?: () => void;
  className?: string;
}

const OtpInput = ({
  length = 6,
  value: controlledValue,
  onChange,
  onComplete,
  resendCooldown = 30,
  onResend,
  className,
}: OtpInputProps) => {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue ?? internalValue;
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, [length]);

  const setValue = useCallback(
    (newValue: string) => {
      const clamped = newValue.slice(0, length);
      if (!controlledValue) setInternalValue(clamped);
      onChange?.(clamped);
      if (clamped.length === length) {
        setIsComplete(true);
        onComplete?.(clamped);
      } else {
        setIsComplete(false);
      }
    },
    [length, controlledValue, onChange, onComplete]
  );

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (!/^\d?$/.test(digit)) return;
      const arr = value.split("");
      while (arr.length < length) arr.push("");
      arr[index] = digit;
      const newValue = arr.join("").replace(/ /g, "");
      setValue(newValue);

      if (digit && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }
    },
    [value, length, setValue]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const arr = value.split("");
        if (arr[index]) {
          arr[index] = "";
          setValue(arr.join(""));
        } else if (index > 0) {
          arr[index - 1] = "";
          setValue(arr.join(""));
          inputsRef.current[index - 1]?.focus();
          setActiveIndex(index - 1);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputsRef.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      } else if (e.key === "ArrowRight" && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }
    },
    [value, length, setValue]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (pasted) {
        setValue(pasted);
        const focusIndex = Math.min(pasted.length, length - 1);
        inputsRef.current[focusIndex]?.focus();
        setActiveIndex(focusIndex);
      }
    },
    [length, setValue]
  );

  const handleResend = () => {
    setTimer(resendCooldown);
    setCanResend(false);
    setValue("");
    setIsComplete(false);
    inputsRef.current[0]?.focus();
    setActiveIndex(0);
    onResend?.();
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const digits = Array.from({ length }, (_, i) => value[i] || "");

  // Helper to compute input class string
  const getInputClass = (i: number, digit: string) => {
    const base =
      "h-12 w-12 rounded-lg border-2 bg-background text-center text-lg font-semibold text-foreground outline-none transition-all duration-200";

    if (isComplete) {
      return `${base} border-green-500 bg-green-500/10`;
    }
    if (activeIndex === i) {
      return `${base} border-primary ring-2 ring-primary/30 scale-105`;
    }
    if (digit) {
      return `${base} border-primary/50`;
    }
    return `${base} border-input`;
  };

  return (
    <div className={`space-y-4${className ? ` ${className}` : ""}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">
          Enter {length}-digit OTP
        </span>
        {isComplete && (
          <CheckCircle2 className="ml-auto h-5 w-5 text-green-500 animate-bounce" />
        )}
      </div>

      {/* OTP Boxes */}
      <div className="flex items-center justify-center gap-2">
        {digits.map((digit, i) => (
          <div key={i} className="flex items-center">
            <input
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              onFocus={() => setActiveIndex(i)}
              className={getInputClass(i, digit)}
              aria-label={`Digit ${i + 1}`}
            />
            {/* Separator in the middle for 6-digit */}
            {length === 6 && i === 2 && (
              <span className="mx-1 font-bold text-muted-foreground">–</span>
            )}
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {digits.map((d, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${d ? "bg-primary scale-125" : "bg-muted-foreground/30"
              }`}
          />
        ))}
      </div>

      {/* Timer + Resend */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Timer className="h-4 w-4" />
          {canResend ? (
            <span>Code expired</span>
          ) : (
            <span>Resend in {formatTime(timer)}</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={!canResend}
          className="gap-1.5 text-primary disabled:text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Resend
        </Button>
      </div>
    </div>
  );
};

export default OtpInput;