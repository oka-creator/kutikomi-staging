// src/components/ProgressBar.tsx

import React from 'react';
import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <Progress value={percentage} className="w-full" />
      <p className="text-sm text-gray-500 mt-2">{`${current} / ${total}`}</p>
    </div>
  );
};

export default ProgressBar;