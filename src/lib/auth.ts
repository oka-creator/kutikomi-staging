// lib/auth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      }
    }
  });

  if (error) throw error;
  
  // ユーザープロフィールの作成
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({ id: data.user!.id, name });
  
  if (profileError) throw profileError;

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function isShopOwner(user: any) {
  return user?.user_metadata?.is_shop_owner === true;
}