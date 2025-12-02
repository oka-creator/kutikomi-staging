// src/config/shopConfig.ts

interface ShopInfo {
    id: string;
    name: string;
    address: string;
    googleReviewUrl: string;
  }
  
  export const shops: Record<string, ShopInfo> = {
    'shop1': {
      id: 'shop1',
      name: '〇〇ラーメン 渋谷店',
      address: '東京都渋谷区〇〇 X-X-X',
      googleReviewUrl: 'https://search.google.com/local/writereview?placeid=XXXXXXXXXXXXXXXXX'
    },
    'shop2': {
      id: 'shop2',
      name: '△△カフェ 新宿店',
      address: '東京都新宿区△△ Y-Y-Y',
      googleReviewUrl: 'https://search.google.com/local/writereview?placeid=YYYYYYYYYYYYYYYYY'
    },
    // 他のショップ情報を追加...
  };
  
  export function getShopInfo(shopId: string): ShopInfo | undefined {
    return shops[shopId];
  }
  
  export function getGoogleReviewUrl(shopId: string): string | undefined {
    return shops[shopId]?.googleReviewUrl;
  }