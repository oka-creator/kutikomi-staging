'use client'

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { BarChart2, Users, LogOut } from "lucide-react"

const AdminHeader: React.FC = () => {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F2B705] text-[#262626] px-4 py-2 flex justify-between items-center">
      <div className="flex items-center">
        <img src="/images/アセット 3@3x.png" alt="Logo" className="h-10 mr-4" />
        <nav className="hidden md:flex space-x-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center py-2 px-3 rounded-lg hover:bg-[#F28705] transition-colors"
          >
            <BarChart2 className="w-5 h-5 mr-2" />
            <span className="font-medium">ダッシュボード</span>
          </Link>
          <Link
            href="/admin/shops"
            className="flex items-center py-2 px-3 rounded-lg hover:bg-[#F28705] transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            <span className="font-medium">ショップ管理</span>
          </Link>
        </nav>
      </div>
      <Button
        onClick={handleSignOut}
        variant="ghost"
        className="text-[#262626] hover:bg-[#F28705] hover:text-white transition-colors"
      >
        <LogOut className="w-5 h-5 mr-2" />
        サインアウト
      </Button>
    </header>
  )
}

export default AdminHeader