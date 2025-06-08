import React from "react";
import { Loader2, FileText, Save, Download } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

interface PageLoadingProps {
  message?: string;
  description?: string;
}

export function PageLoading({
  message = "Loading...",
  description = "Please wait while we prepare your content",
}: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">{message}</p>
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      </div>
    </div>
  );
}

interface CVLoadingProps {
  operation?: "saving" | "generating" | "loading" | "deleting";
  message?: string;
}

export function CVLoading({ operation = "loading", message }: CVLoadingProps) {
  const operationConfig = {
    saving: {
      icon: Save,
      defaultMessage: "Saving your CV...",
      description: "Please wait while we save your changes",
      color: "text-blue-600 border-blue-600",
    },
    generating: {
      icon: Download,
      defaultMessage: "Generating PDF...",
      description: "Creating your professional CV document",
      color: "text-green-600 border-green-600",
    },
    loading: {
      icon: FileText,
      defaultMessage: "Loading CV...",
      description: "Retrieving your CV data",
      color: "text-gray-600 border-gray-600",
    },
    deleting: {
      icon: Loader2,
      defaultMessage: "Deleting CV...",
      description: "Removing CV from your collection",
      color: "text-red-600 border-red-600",
    },
  };

  const config = operationConfig[operation];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div
          className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${config.color} mb-4`}
        >
          <Icon className="h-6 w-6 m-3" />
        </div>
        <p className="text-gray-700 font-medium">
          {message || config.defaultMessage}
        </p>
        <p className="text-sm text-gray-500 mt-1">{config.description}</p>
      </div>
    </div>
  );
}

interface ButtonLoadingProps {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
}

export function ButtonLoading({
  loading = false,
  children,
  loadingText,
  className = "",
  onClick,
  disabled,
  variant = "default",
  size = "md",
  ...props
}: ButtonLoadingProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          {loadingText || "Loading..."}
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface FormLoadingOverlayProps {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
}

export function FormLoadingOverlay({
  loading,
  message = "Processing...",
  children,
}: FormLoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white p-6 rounded-lg shadow-lg border text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-3 text-blue-600" />
            <p className="text-gray-700 font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

export function CVCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  );
}

export function CVFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}
