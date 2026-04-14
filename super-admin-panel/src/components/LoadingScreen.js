"use client";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-indigo-100 rounded-full"></div>
          </div>
        </div>
        <p className="text-gray-700 font-medium text-lg">Loading your dashboard...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
      </div>
    </div>
  );
}
