// Loading component with SEO-friendly UI
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading VisualCV Builder...</p>
        <p className="text-sm text-gray-500 mt-2">
          Please wait while we prepare your CV builder
        </p>
      </div>
    </div>
  );
}
