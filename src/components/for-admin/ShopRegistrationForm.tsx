import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface ShopData {
  name: string;
  address: string;
  google_review_url?: string;
  email: string;
  password: string;
  businessType: string;
  monthlyReviewLimit: number;
}

export interface ShopRegistrationFormProps {
  onSubmit: (data: ShopData) => Promise<void>;
}

const ShopRegistrationForm: React.FC<ShopRegistrationFormProps> = ({
  onSubmit,
}) => {
  const [shopData, setShopData] = useState<ShopData>({
    name: "",
    address: "",
    google_review_url: "",
    email: "",
    password: "",
    businessType: "",
    monthlyReviewLimit: 100,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShopData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessTypeChange = (value: string) => {
    setShopData((prev) => ({ ...prev, businessType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log("Submitting shop data:", shopData);
      await onSubmit(shopData);
      console.log("Shop registered successfully");
      setShopData({
        name: "",
        address: "",
        google_review_url: "",
        email: "",
        password: "",
        businessType: "",
        monthlyReviewLimit: 100,
      });
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "ショップの登録に失敗しました";
      if (error instanceof Error) {
        errorMessage += ": " + error.message;
      }
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">ショップ名</Label>
        <Input
          id="name"
          name="name"
          value={shopData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="address">住所</Label>
        <Input
          id="address"
          name="address"
          value={shopData.address}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="google_review_url">Google レビューURL</Label>
        <Input
          id="google_review_url"
          name="google_review_url"
          value={shopData.google_review_url}
          onChange={handleChange}
          placeholder="Google マップのレビューURLを入力してください"
        />
      </div>
      <div>
        <Label htmlFor="businessType">業種</Label>
        <Select
          onValueChange={handleBusinessTypeChange}
          value={shopData.businessType}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="業種を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="restaurant">飲食店</SelectItem>
            <SelectItem value="retail">小売店</SelectItem>
            <SelectItem value="service">サービス業</SelectItem>
            <SelectItem value="other">その他</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={shopData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={shopData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="monthlyReviewLimit">月間レビュー生成制限</Label>
        <Input
          id="monthlyReviewLimit"
          name="monthlyReviewLimit"
          type="number"
          value={shopData.monthlyReviewLimit}
          onChange={handleChange}
          required
          min="1"
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" className="w-full">
        登録
      </Button>
    </form>
  );
};

export default ShopRegistrationForm;