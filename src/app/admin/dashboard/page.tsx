'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminHeader from '@/components/for-admin/shops/AdminHeader'
import TotalShopsCard from '@/components/for-admin/dashboard/TotalShopsCard'
import TotalReviewsCard from '@/components/for-admin/dashboard/TotalReviewsCard'
import BusinessTypeChart from '@/components/for-admin/dashboard/BusinessTypeChart'
import MonthlyReviewChart from '@/components/for-admin/dashboard/MonthlyReviewChart'
import Footer from '@/components/Footer'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string | string[]
  }[]
}

interface DashboardData {
  totalShops: number
  totalReviews: number
  businessTypeData: ChartData
  monthlyReviewData: ChartData
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalShops: 0,
    totalReviews: 0,
    businessTypeData: {
      labels: [],
      datasets: [{ label: '業種別ショップ数', data: [], backgroundColor: [] }],
    },
    monthlyReviewData: {
      labels: [],
      datasets: [{ label: '月別口コミ数', data: [], backgroundColor: 'rgba(242, 183, 5, 0.6)' }],
    },
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-data', {
        credentials: 'include',
      })
      const data: DashboardData = await response.json()

      if (response.ok) {
        setDashboardData(data)
      } else {
        console.error('ダッシュボードデータの取得エラー:', data)
      }
    } catch (error) {
      console.error('ダッシュボードデータの取得エラー:', error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
      <AdminHeader />
      <main className="flex-1 p-6 mt-16 overflow-auto">
        <div className="grid grid-cols-12 gap-6">
          <motion.div 
            className="col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TotalShopsCard totalShops={dashboardData.totalShops} />
          </motion.div>
          <motion.div 
            className="col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <TotalReviewsCard totalReviews={dashboardData.totalReviews} />
          </motion.div>
          <motion.div 
            className="col-span-8 row-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MonthlyReviewChart data={dashboardData.monthlyReviewData} />
          </motion.div>
          <motion.div 
            className="col-span-4 row-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <BusinessTypeChart data={dashboardData.businessTypeData} />
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}