import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from 'lucide-react'

interface TotalReviewsCardProps {
  totalReviews: number
}

const TotalReviewsCard: React.FC<TotalReviewsCardProps> = ({ totalReviews }) => {
  return (
    <Card className="bg-white shadow-lg h-[250px]">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <MessageSquare className="h-16 w-16 text-[#F2B705]" />
          <h2 className="text-3xl font-bold text-[#262626]">総レビュー数</h2>
        </div>
        <p className="text-6xl font-bold text-center text-[#F2B705]">{totalReviews}</p>
        <div className="text-xl text-gray-500 text-center">投稿されたレビュー</div>
      </CardContent>
    </Card>
  )
}

export default TotalReviewsCard