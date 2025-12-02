import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface SurveyResponsesProps {
  responses: Record<string, string>;
}

const SurveyResponses: React.FC<SurveyResponsesProps> = ({ responses }) => (
  <Card>
    <CardHeader>
      <h2 className="text-xl font-semibold">アンケート回答内容</h2>
    </CardHeader>
    <CardContent>
      {Object.entries(responses).map(([question, answer]) => (
        <div key={question} className="mb-2">
          <strong>{question}:</strong> {answer}
        </div>
      ))}
    </CardContent>
  </Card>
);

export default SurveyResponses;