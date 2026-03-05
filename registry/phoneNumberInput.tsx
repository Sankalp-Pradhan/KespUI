import { useState, useRef } from "react";
import { Phone, Check, AlertCircle, MessageCircle } from "lucide-react";

interface PhoneInputProps {
  className?: string;
  /** Controlled: phone number value (10 raw digits). Omit for uncontrolled. */
  value?: string;
  /** Controlled: callback with raw 10-digit string */
  onChange?: (value: string) => void;
  /** Show WhatsApp verification toggle */
  enableWhatsApp?: boolean;
  /** Controlled: WhatsApp toggle state */
  whatsAppEnabled?: boolean;
  /** WhatsApp toggle callback */
  onWhatsAppToggle?: (enabled: boolean) => void;
  /** External error message */
  error?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Input placeholder */
  placeholder?: string;
}

// ─── Pure helpers (no hooks) ────────────────────────────────────────────────

function formatPhoneNumber(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  return d.length <= 5 ? d : `${d.slice(0, 5)} ${d.slice(5)}`;
}

function validatePhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (!d) return "";
  if (d.length < 10) return "Phone number must be 10 digits";
  if (!["6", "7", "8", "9"].includes(d[0]))
    return "Phone number must start with 6, 7, 8, or 9";
  return "";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PhoneInput({
  value: controlledValue,
  onChange,
  enableWhatsApp = false,
  whatsAppEnabled: controlledWhatsApp,
  onWhatsAppToggle,
  error: externalError,
  disabled = false,
  placeholder = "98765 43210",
}: PhoneInputProps) {
  const isControlled = controlledValue !== undefined;
  const isWhatsAppControlled = controlledWhatsApp !== undefined;

  // Uncontrolled internal state
  const [internalPhone, setInternalPhone] = useState("");
  const [internalWhatsApp, setInternalWhatsApp] = useState(false);

  // Interaction state
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState("");
  const [touched, setTouched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Resolved values
  const value = isControlled ? (controlledValue ?? "") : internalPhone;
  const whatsAppEnabled = isWhatsAppControlled
    ? (controlledWhatsApp ?? false)
    : internalWhatsApp;

  // ── Handlers ────────────────────────────────────────────────────────────

  function commitValue(raw: string) {
    const clean = raw.replace(/\D/g, "").slice(0, 10);
    if (!isControlled) setInternalPhone(clean);
    onChange?.(clean);
    if (touched) setInternalError(validatePhone(clean));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    commitValue(e.target.value);
  }

  function handleBlur() {
    setIsFocused(false);
    setTouched(true);
    setInternalError(validatePhone(value));
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    commitValue(e.clipboardData.getData("text"));
    setTouched(true);
  }

  function handleWhatsAppToggle() {
    const next = !whatsAppEnabled;
    if (!isWhatsAppControlled) setInternalWhatsApp(next);
    onWhatsAppToggle?.(next);
  }

  // ── Derived state ────────────────────────────────────────────────────────

  const currentError = externalError || internalError;
  const isValid = value.length === 10 && !currentError;
  const hasError = touched && !!currentError;
  const showSuccess = isValid && touched;

  // ── Styles ───────────────────────────────────────────────────────────────

  const borderClass = hasError
    ? "border-red-500 dark:border-red-400"
    : isValid
      ? "border-green-500 dark:border-green-400"
      : isFocused
        ? "border-black dark:border-white"
        : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500";

  const iconClass = hasError
    ? "text-red-500 dark:text-red-400"
    : isValid
      ? "text-green-500 dark:text-green-400"
      : "text-neutral-500 dark:text-neutral-400";

  return (
    <div className="w-full">
      <style>{`
        @keyframes phone-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .phone-fade-in { animation: phone-fade-in 0.2s ease-out both; }
      `}</style>

      {/* ── Input row ── */}
      <div
        className={[
          "flex items-center rounded-lg border transition-all duration-200",
          disabled
            ? "opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900"
            : "bg-white dark:bg-neutral-900",
          borderClass,
        ].join(" ")}
      >
        {/* Phone icon */}
        <div className="pl-4 pr-3 flex items-center shrink-0">
          <Phone
            size={18}
            className={`transition-colors duration-200 ${iconClass}`}
          />
        </div>

        {/* +91 prefix */}
        <div className="flex items-center pr-2 shrink-0">
          <span className="text-[15px] font-semibold text-black dark:text-white select-none">
            +91
          </span>
          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 ml-3" />
        </div>

        {/* Text input */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          value={formatPhoneNumber(value)}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? "phone-error" : undefined}
          className={[
            "flex-1 py-3 pr-4 bg-transparent outline-none",
            "text-[15px] text-black dark:text-white",
            "placeholder-neutral-400 dark:placeholder-neutral-600",
            disabled ? "cursor-not-allowed" : "",
          ].join(" ")}
        />

        {/* Trailing icon */}
        {isValid && !hasError && (
          <div className="pr-4 flex items-center shrink-0">
            <div className="w-5 h-5 rounded-full bg-green-500 dark:bg-green-400 flex items-center justify-center">
              <Check size={12} className="text-white" strokeWidth={3} />
            </div>
          </div>
        )}
        {hasError && (
          <div className="pr-4 flex items-center shrink-0">
            <AlertCircle
              size={20}
              className="text-red-500 dark:text-red-400"
            />
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      {hasError && (
        <div
          id="phone-error"
          role="alert"
          className="mt-2 flex items-start gap-1.5 phone-fade-in"
        >
          <AlertCircle
            size={14}
            className="text-red-500 dark:text-red-400 mt-0.5 shrink-0"
          />
          <p className="text-[13px] text-red-500 dark:text-red-400">
            {currentError}
          </p>
        </div>
      )}

      {showSuccess && !hasError && (
        <div className="mt-2 flex items-start gap-1.5 phone-fade-in">
          <Check
            size={14}
            className="text-green-500 dark:text-green-400 mt-0.5 shrink-0"
          />
          <p className="text-[13px] text-green-500 dark:text-green-400">
            Valid phone number
          </p>
        </div>
      )}

      {/* ── WhatsApp toggle ── */}
      {enableWhatsApp && (
        <button
          type="button"
          onClick={handleWhatsAppToggle}
          disabled={disabled || !isValid}
          className={[
            "mt-4 flex items-center gap-3 p-4 rounded-lg border w-full",
            "transition-all duration-200 text-left",
            disabled || !isValid
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer",
            whatsAppEnabled
              ? "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400"
              : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700",
            !disabled && isValid && !whatsAppEnabled
              ? "hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-500 active:scale-[0.99]"
              : "",
          ].join(" ")}
        >
          {/* Pill toggle */}
          <div
            className={[
              "relative w-11 h-6 rounded-full transition-all duration-200 shrink-0",
              whatsAppEnabled
                ? "bg-green-500 dark:bg-green-400"
                : "bg-neutral-300 dark:bg-neutral-600",
            ].join(" ")}
          >
            <div
              className={[
                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200",
                whatsAppEnabled ? "left-5.5" : "left-0.5",
              ].join(" ")}
            />
          </div>

          {/* Label */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MessageCircle
              size={20}
              className={
                whatsAppEnabled
                  ? "text-green-500 dark:text-green-400 shrink-0"
                  : "text-neutral-500 dark:text-neutral-400 shrink-0"
              }
            />
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[14px] font-medium text-black dark:text-white">
                WhatsApp Verification
              </span>
              <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
                {whatsAppEnabled ? "Enabled" : "Tap to enable"}
              </span>
            </div>
          </div>

          {whatsAppEnabled && (
            <Check
              size={18}
              className="text-green-500 dark:text-green-400 shrink-0"
            />
          )}
        </button>
      )}
    </div>
  );
}