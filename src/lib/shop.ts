// lib/shop.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

export interface Shop {
  id: string;
  name: string;
  address: string;
  google_review_url?: string;
  monthly_review_limit: number;
  owner_id: string;
  business_type: string;
}

export interface ShopData {
  name: string;
  address: string;
  google_review_url?: string;
  monthly_review_limit: number;
  business_type: string;
}

export async function registerShop(ownerId: string, shopData: ShopData) {
  const { data, error } = await supabase
    .from('shops')
    .insert({ ...shopData, owner_id: ownerId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// lib/shop.ts
export async function updateShop(adminId: string, shopId: string, shopData: Partial<ShopData>, ownerData?: { email?: string, password?: string }) {
  // 管理者の権限チェック
  const { data: adminCheck } = await supabase
    .from('users')
    .select('role')
    .eq('id', adminId)
    .single();

  if (adminCheck?.role !== 'admin') {
    throw new Error('管理者権限がありません');
  }

  // ショップ情報の更新
  const { data: updatedShop, error: shopError } = await supabase
    .from('shops')
    .update(shopData)
    .eq('id', shopId)
    .select()
    .single();

  if (shopError) throw shopError;

  // ショップオーナー情報の更新（もし提供されていれば）
  if (ownerData && updatedShop.owner_id) {
    const { error: ownerError } = await supabase.auth.admin.updateUserById(
      updatedShop.owner_id,
      ownerData
    );

    if (ownerError) throw ownerError;
  }

  return updatedShop;
}

export async function getShopIdForUser(userId: string) {
  const { data, error } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (error) throw error;
  return data?.id;
}