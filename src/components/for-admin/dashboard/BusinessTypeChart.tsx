import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Pie } from 'react-chartjs-2'
import { PieChart } from 'lucide-react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface BusinessTypeChartProps {
  data: ChartData<'pie'>
}

const BusinessTypeChart: React.FC<BusinessTypeChartProps> = ({ data }) => {
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 12,
          },
          color: '#262626',
        },
      },
      title: {
        display: true,
        text: '業種別ショップ分布',
        color: '#262626',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        titleColor: '#262626',
        bodyColor: '#262626',
        borderColor: '#F2B705',
        borderWidth: 1,
      },
    },
  }

  // 業種の英語表記から日本語表記へのマッピング
  const businessTypeTranslation: { [key: string]: string } = {
    'restaurant': '飲食店',
    'retail': '小売店',
    'service': 'サービス業',
    'other': 'その他',
  }
   // 固定順序の定義
   const fixedOrder = ['restaurant', 'retail', 'service', 'other']

   // データを固定順序で再構成
   const orderedData = fixedOrder.map(type => {
     const index = data.labels?.indexOf(type) ?? -1
     return index !== -1 ? (data.datasets[0].data[index] as number) : 0
   })
 

  // データのラベルを日本語に変換
  const translatedData = {
    labels: fixedOrder.map(type => businessTypeTranslation[type]),
    datasets: [
      {
        ...data.datasets[0],
        data: orderedData,
        backgroundColor: [
          'rgba(242, 39, 5, 0.8)',   // 飲食店（赤）
          'rgba(242, 183, 5, 0.8)',  // 小売店（黄）
          'rgba(242, 87, 5, 0.8)',   // サービス業（オレンジ）
          'rgba(242, 135, 5, 0.8)',  // その他（薄いオレンジ）
        ],
        borderColor: '#FFFFFF',
        borderWidth: 1,
      },
    ],
  }

  return (
    <Card className="bg-white shadow-lg w-full h-[500px]">
      <CardContent className="p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <PieChart className="h-8 w-8 text-[#F2B705]" />
          <h2 className="text-2xl font-bold text-[#262626]">業種別ショップ分布</h2>
        </div>
        <div className="h-[400px]">
          <Pie data={translatedData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}

export default BusinessTypeChart