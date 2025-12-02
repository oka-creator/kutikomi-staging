import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatsProps {
  totalShops: number;
  totalReviews: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ totalShops, totalReviews }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <Card>
      <CardHeader>
        <CardTitle>総ショップ数</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{totalShops}</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>総口コミ数（全ショップ）</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{totalReviews}</p>
      </CardContent>
    </Card>
  </div>
);

export default DashboardStats;