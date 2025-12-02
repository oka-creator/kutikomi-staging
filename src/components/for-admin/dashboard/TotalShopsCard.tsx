import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Users } from 'lucide-react'

interface TotalShopsCardProps {
  totalShops: number
}

const TotalShopsCard: React.FC<TotalShopsCardProps> = ({ totalShops }) => {
  return (
    <Card className="bg-white shadow-lg h-[250px]">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <Users className="h-16 w-16 text-[#F2B705]" />
          <h2 className="text-3xl font-bold text-[#262626]">総ショップ数</h2>
        </div>
        <p className="text-6xl font-bold text-center text-[#F2B705]">{totalShops}</p>
        <div className="text-xl text-gray-500 text-center">登録ショップ</div>
      </CardContent>
    </Card>
  )
}

export default TotalShopsCard