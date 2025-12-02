import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // まず、既存のセッションをクリア
      await logout();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error("ユーザーデータが取得できませんでした");
  
      const userRole = data.user.user_metadata?.role || data.user.app_metadata?.user_type;
      if (!userRole) throw new Error("ユーザーロールが設定されていません");
  
      console.log('User role:', userRole); // デバッグ用
  
      switch(userRole) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'shop_owner':
          // shop_owner の場合、関連する shopId を取得
          const { data: shopData, error: shopError } = await supabase
            .from('shops')
            .select('id')
            .eq('owner_id', data.user.id)
            .single();
          
          if (shopError) throw shopError;
          if (!shopData) throw new Error("関連するショップが見つかりません");
          
          router.push(`/owner-dashboard/${shopData.id}`);
          break;
        default:
          throw new Error(`不明なユーザーロール: ${userRole}`);
      }

      return { success: true, userRole };
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        switch (error.message) {
          case 'Invalid login credentials':
            setError("メールアドレスまたはパスワードが正しくありません");
            break;
          case 'Email not confirmed':
            setError("メールアドレスが確認されていません。メールをご確認ください");
            break;
          default:
            setError(error.message);
        }
      } else {
        setError("予期せぬエラーが発生しました");
      }
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const userRole = session.user.user_metadata?.role || session.user.app_metadata?.user_type;
      if (userRole === 'admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'shop_owner') {
        const { data: shopData } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', session.user.id)
          .single();
        
        if (shopData) {
          router.push(`/owner-dashboard/${shopData.id}`);
        } else {
          console.error('Shop not found for the logged-in user');
          // ここでエラー処理を追加することもできます
        }
      }
      return true;
    }
    return false;
  };

  return { login, logout, isLoading, error, checkSession };
};