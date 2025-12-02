// src/components/ErrorHandler.tsx
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorHandlerProps {
  error: string;
  onRetry?: () => void;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error, onRetry }) => {
  return (
    <Alert variant="destructive">
      <AlertTitle>エラーが発生しました</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
      {onRetry && (
        <Button onClick={onRetry} className="mt-4">
          再試行
        </Button>
      )}
    </Alert>
  );
};

export default ErrorHandler;