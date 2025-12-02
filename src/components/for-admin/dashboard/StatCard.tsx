import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

export default StatCard;