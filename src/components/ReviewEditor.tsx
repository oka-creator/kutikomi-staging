// src/components/ReviewEditor.tsx
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import HighlightedText from '@/components/HighlightedText';

interface ReviewEditorProps {
  review: string;
  keywords: string[];
  isEditing: boolean;
  onEdit: () => void;
  onSave: (editedReview: string) => void;
  onChange: (value: string) => void;
}

const ReviewEditor: React.FC<ReviewEditorProps> = ({
  review,
  keywords,
  isEditing,
  onEdit,
  onSave,
  onChange,
}) => {
  const handleSave = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onSave(review);
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">AI生成レビュー</h2>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <>
            <Textarea
              value={review}
              onChange={(e) => onChange(e.target.value)}
              rows={5}
              className="w-full"
              aria-label="レビュー編集"
            />
            <p className="text-sm text-gray-500 mt-2" id="keyword-instruction">
              注意: 以下のキーワードは必ず含めてください: {keywords.join(', ')}
            </p>
          </>
        ) : (
          <div aria-label="生成されたレビュー">
            <HighlightedText text={review} keywords={keywords} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isEditing ? (
          <Button onClick={handleSave} aria-describedby="keyword-instruction">保存</Button>
        ) : (
          <Button onClick={onEdit}>編集</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReviewEditor;