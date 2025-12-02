// ShopList.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from 'lucide-react';
import { Shop } from '@/lib/shop';

interface ShopListProps {
  shops: Shop[];
  isLoading: boolean;
  onShopSelect: (shop: Shop) => void;
  onShopDelete: (shop: Shop) => void; // 削除ハンドラを追加
}

const ShopList: React.FC<ShopListProps> = ({ shops, isLoading, onShopSelect, onShopDelete }) => {
  if (isLoading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3 text-[#262626]">名前</TableHead>
            <TableHead className="w-1/2 text-[#262626]">住所</TableHead>
            <TableHead className="w-1/6 text-[#262626]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shops.map((shop) => (
            <TableRow key={shop.id}>
              <TableCell className="font-medium text-[#262626]">{shop.name}</TableCell>
              <TableCell className="text-[#262626]">{shop.address}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onShopSelect(shop)}
                    variant="outline"
                    size="sm"
                    className="flex items-center bg-[#F2B705] text-[#262626] hover:bg-[#F28705]"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    編集
                  </Button>
                  <Button
                    onClick={() => onShopDelete(shop)}
                    variant="outline"
                    size="sm"
                    className="flex items-center bg-red-500 text-white hover:bg-red-600"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    削除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ShopList;
