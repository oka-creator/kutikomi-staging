// src/components/ShopInfo.tsx
import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface ShopInfoProps {
  shopInfo: {
    name: string;
    address: string;
  };
}

const ShopInfo: React.FC<ShopInfoProps> = ({ shopInfo }) => (
  <Card>
    <CardHeader>
      <h2 className="text-xl font-semibold">{shopInfo.name}</h2>
    </CardHeader>
    <CardContent>
      <p>{shopInfo.address}</p>
    </CardContent>
  </Card>
);

export default ShopInfo;