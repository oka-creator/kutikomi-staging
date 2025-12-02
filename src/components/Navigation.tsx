// src/components/Navigation.tsx

import React from 'react';
import { Button } from "@/components/ui/button"

interface NavigationProps {
  onPrev: () => void;
  onNext: () => void;
  showPrev: boolean;
  showNext: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ onPrev, onNext, showPrev, showNext }) => {
  return (
    <div className="flex justify-between w-full">
      {showPrev && <Button onClick={onPrev} variant="outline">前へ</Button>}
      {showNext && <Button onClick={onNext}>次へ</Button>}
    </div>
  );
};

export default Navigation;