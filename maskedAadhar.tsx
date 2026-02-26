import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

interface MaskedAadhaarUploadProps {
    onFileSelect?: (file: File | null) => void;
    className?: string;
    label?: string;
    maxSizeMB?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const MaskedAadhaarUpload: React.FC<MaskedAadhaarUploadProps> = ({
    onFileSelect,
    className,
    label = "Upload Masked Aadhaar",
    maxSizeMB = 5,
}) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const processFile = useCallback(
        (file: File) => {
            setError(null);

            if (!ACCEPTED_TYPES.includes(file.type)) {
                setError("Only JPG, PNG, or WebP images are accepted");
                return;
            }

            if (file.size > maxSizeMB * 1024 * 1024) {
                setError(`File must be under ${maxSizeMB}MB`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
                setFileName(file.name);
                setFileSize(formatFileSize(file.size));
                setShowPreview(false);
                onFileSelect?.(file);
            };
            reader.readAsDataURL(file);
        },
        [maxSizeMB, onFileSelect]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) processFile(file);
        },
        [processFile]
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const removeFile = () => {
        setPreview(null);
        setFileName(null);
        setFileSize(null);
        setError(null);
        setShowPreview(false);
        if (inputRef.current) inputRef.current.value = "";
        onFileSelect?.(null);
    };

    return (
        <div className={cn("w-full max-w-sm", className)}>
            {label && (
                <label className="block text-sm font-medium text-foreground mb-1.5">
                    {label}
                </label>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleChange}
                className="hidden"
            />

            {!preview ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-8 cursor-pointer transition-all duration-200",
                        dragging
                            ? "border-primary bg-primary/5 shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                            : error
                                ? "border-destructive bg-destructive/5"
                                : "border-input hover:border-muted-foreground/40 bg-card"
                    )}
                >
                    <div
                        className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                            dragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}
                    >
                        <Upload className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                            {dragging ? "Drop your file here" : "Click or drag to upload"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            JPG, PNG, or WebP · Max {maxSizeMB}MB
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative rounded-lg border-2 border-aadhaar-success bg-card overflow-hidden transition-all duration-200">
                    {/* Blurred / visible preview */}
                    <div className="relative aspect-16/10 w-full bg-muted overflow-hidden">
                        <img
                            src={preview}
                            alt="Masked Aadhaar preview"
                            className={cn(
                                "h-full w-full object-cover transition-all duration-300",
                                showPreview ? "blur-0" : "blur-lg scale-105"
                            )}
                        />
                        {!showPreview && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                                <ShieldCheck className="h-8 w-8 text-aadhaar-success" />
                            </div>
                        )}
                    </div>

                    {/* File info bar */}
                    <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-aadhaar-success" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{fileName}</p>
                            <p className="text-[10px] text-muted-foreground">{fileSize}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPreview((p) => !p)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            aria-label={showPreview ? "Hide preview" : "Show preview"}
                        >
                            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                            type="button"
                            onClick={removeFile}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            aria-label="Remove file"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Helper / error text */}
            <div className="mt-1.5 text-xs">
                {error ? (
                    <span className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                    </span>
                ) : preview ? (
                    <span className="text-aadhaar-success">Aadhaar photo uploaded</span>
                ) : (
                    <span className="text-muted-foreground">
                        Upload a masked Aadhaar card image (number partially hidden) max5mb
                    </span>
                )}
            </div>
        </div>
    );
};

export default MaskedAadhaarUpload;
