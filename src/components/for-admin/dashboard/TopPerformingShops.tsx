import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ShopData {
  id: string;
  name: string;
  businessType: string;
  reviewCount: number;
  averageRating: number;
}

interface TopPerformingShopsProps {
  shops: ShopData[];
}

const TopPerformingShops: React.FC<TopPerformingShopsProps> = ({ shops }) => (
  <Card className="mt-8">
    <CardHeader>
      <CardTitle>トップパフォーマンスのショップ</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ショップ名</TableHead>
            <TableHead>業種</TableHead>
            <TableHead>レビュー数</TableHead>
            <TableHead>平均評価</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shops.map((shop) => (
            <TableRow key={shop.id}>
              <TableCell>{shop.name}</TableCell>
              <TableCell>{shop.businessType}</TableCell>
              <TableCell>{shop.reviewCount}</TableCell>
              <TableCell>{shop.averageRating.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default TopPerformingShops;