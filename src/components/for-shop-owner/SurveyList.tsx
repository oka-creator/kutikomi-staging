// src/components/for-shop-owner/SurveyList.tsx
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Survey } from '@/types';
import SurveyDetailModal from './SurveyDetailModal';

interface SurveyListProps {
  surveys: Survey[];
}

const SurveyList: React.FC<SurveyListProps> = ({ surveys }) => {
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>顧客名</TableHead>
            <TableHead>日付</TableHead>
            <TableHead>詳細</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id}>
              <TableCell>{survey.customerName}</TableCell>
              <TableCell>{survey.date}</TableCell>
              <TableCell>
                <Button variant="link" onClick={() => setSelectedSurvey(survey)}>詳細を見る</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedSurvey && (
        <SurveyDetailModal
          isOpen={!!selectedSurvey}
          onClose={() => setSelectedSurvey(null)}
          survey={selectedSurvey}
        />
      )}
    </>
  );
};

export default SurveyList;