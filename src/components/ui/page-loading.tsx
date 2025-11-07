
import React from "react";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "./loading-spinner";

interface PageLoadingProps {
  progress?: number;
  text?: string;
  showProgress?: boolean;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  progress = 0,
  text = "Loading...",
  showProgress = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
          <LoadingSpinner size="lg" className="text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">JaipurCircle</h2>
        <p className="text-gray-600">{text}</p>
        {showProgress && (
          <div className="w-64 mx-auto">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
          </div>
        )}
      </div>
    </div>
  );
};
