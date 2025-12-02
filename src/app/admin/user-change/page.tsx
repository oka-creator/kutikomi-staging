// AccountSettings.tsx
"use client";
import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

export default function AccountSettings() {
  const supabase = createClientComponentClient();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = { password };

      const { error } = await supabase.auth.updateUser(updates);

      if (error) {
        throw error;
      }

      toast.success("パスワードが更新されました。");
      setPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "パスワードの更新に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">パスワード変更</h2>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          新しいパスワード
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="新しいパスワードを入力"
          className="mt-1"
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "更新中..." : "パスワードを更新"}
      </Button>
    </form>
  );
}
