import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onSignOut: () => void;
  shopName: string;
}

export default function Header({ onSignOut, shopName }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuVariants = {
    closed: { y: "-100%", opacity: 0 },
    open: { y: "0%", opacity: 1 }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F2B705] text-[#262626] px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/images/アセット 3@3x.png"
            alt="クチコミファースト ロゴ"
            width={150}
            height={45}
            className="h-10 w-auto object-contain"
          />
          <span className="sr-only">クチコミファースト</span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <a href="https://business.form-mailer.jp/fms/6cc821f9259353" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" className="bg-white text-[#262626] hover:bg-gray-100">
              お問い合わせ
            </Button>
          </a>
          <Button
            onClick={onSignOut}
            variant="ghost"
            className="text-[#262626] hover:bg-[#F28705] hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            サインアウト
          </Button>
        </div>
        <div className="md:hidden">
          <Button
            variant="ghost"
            className="text-[#262626]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </header>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 right-0 bg-[#F2B705] shadow-md py-4 px-4 md:hidden z-40"
            style={{ top: '56px' }}
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ duration: 0.3 }}
          >
            <a href="https://business.form-mailer.jp/fms/6cc821f9259353" target="_blank" rel="noopener noreferrer" className="block mb-4">
              <Button variant="ghost" className="w-full text-left text-[#262626]">
                お問い合わせ
              </Button>
            </a>
            <Button
              onClick={onSignOut}
              variant="ghost"
              className="w-full text-left text-[#262626]"
            >
              サインアウト
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}