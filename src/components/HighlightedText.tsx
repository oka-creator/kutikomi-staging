// src/components/HighlightedText.tsx
import React from 'react';

interface HighlightedTextProps {
  text: string;
  keywords: string[];
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, keywords }) => {
  const highlightText = (input: string) => {
    let result = input;
    keywords.forEach((keyword) => {
      const regex = new RegExp(keyword, 'gi');
      result = result.replace(regex, match => `<mark class="bg-yellow-200 rounded">${match}</mark>`);
    });
    return result;
  };

  return (
    <p dangerouslySetInnerHTML={{ __html: highlightText(text) }} />
  );
};

export default HighlightedText;