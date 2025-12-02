import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface QuestionProps {
  question: {
    id: string;
    text: string;
    type: 'radio' | 'checkbox' | 'text';
    options?: string[];
  };
  answer: string | string[];
  setAnswer?: (value: string | string[]) => void;
}

const Question: React.FC<QuestionProps> = ({ question, answer, setAnswer }) => {
  const isReadOnly = !setAnswer;

  const handleChange = (value: string | string[]) => {
    if (setAnswer) {
      setAnswer(value);
    }
  };

  switch (question.type) {
    case 'radio':
      return (
        <div className="space-y-4">
          <h3 className="font-medium">{question.text}</h3>
          <RadioGroup
            onValueChange={handleChange}
            value={answer as string}
            disabled={isReadOnly}
          >
            {question.options?.map((option) => (
              <div className="flex items-center space-x-2" key={option}>
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-4">
          <h3 className="font-medium">{question.text}</h3>
          {question.options?.map((option) => (
            <div className="flex items-center space-x-2" key={option}>
              <Checkbox
                id={`${question.id}-${option}`}
                checked={(answer as string[]).includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleChange([...(answer as string[]), option]);
                  } else {
                    handleChange((answer as string[]).filter((item) => item !== option));
                  }
                }}
                disabled={isReadOnly}
              />
              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
            </div>
          ))}
        </div>
      );
    case 'text':
      return (
        <div className="space-y-4">
          <h3 className="font-medium">{question.text}</h3>
          <Input
            type="text"
            value={answer as string}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="回答を入力してください"
            readOnly={isReadOnly}
          />
        </div>
      );
    default:
      return null;
  }
};

export default Question;