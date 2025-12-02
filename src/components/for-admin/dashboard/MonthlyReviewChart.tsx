import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Bar } from 'react-chartjs-2'
import { BarChart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface MonthlyReviewChartProps {
  data: ChartData<'bar'>
}

const MonthlyReviewChart: React.FC<MonthlyReviewChartProps> = ({ data }) => {
  const [chartData, setChartData] = useState<ChartData<'bar'> | null>(null)

  useEffect(() => {
    if (data && Array.isArray(data.datasets) && data.datasets.length > 0) {
      setChartData({
        ...data,
        datasets: [
          {
            ...data.datasets[0],
            backgroundColor: 'rgba(242, 183, 5, 0.6)',
            borderColor: 'rgba(242, 183, 5, 1)',
            borderWidth: 1,
          },
        ],
      })
    } else {
      setChartData(null)
    }
  }, [data])

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '月別レビュー数',
        color: '#262626',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#262626',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#262626',
        },
      },
    },
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="bg-white shadow-lg w-full h-[500px]">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <p className="text-lg text-gray-500">データがありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-lg w-full h-[500px]">
      <CardContent className="p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <BarChart className="h-8 w-8 text-[#F2B705]" />
          <h2 className="text-2xl font-bold text-[#262626]">月別レビュー数</h2>
        </div>
        <div className="h-[400px]">
          {chartData ? (
            <Bar options={options} data={chartData} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg text-gray-500">
                データがありません
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default MonthlyReviewChart