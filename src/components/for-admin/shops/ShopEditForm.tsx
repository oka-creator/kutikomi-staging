import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Save, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shop } from "@/lib/shop";

interface ShopEditFormProps {
  shop: Shop;
  onSubmit: (
    updatedShop: Shop,
    newEmail?: string,
    newPassword?: string
  ) => Promise<void>;
}

export default function ShopEditForm({ shop, onSubmit }: ShopEditFormProps) {
  const [editedShop, setEditedShop] = useState<Shop>(shop);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedShop((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessTypeChange = (value: string) => {
    setEditedShop((prev) => ({ ...prev, business_type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", {
      editedShop,
      newEmail,
      newPassword,
    });

    try {
      await onSubmit(editedShop, newEmail, newPassword);
      console.log("Shop updated successfully");
    } catch (error) {
      console.error("Error updating shop:", error);
    }
  };

  const handleSurveySettingsNavigation = () => {
    router.push(`/admin/survey-settings/${shop.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-[#262626]">
            ショップ名
          </Label>
          <Input
            id="name"
            name="name"
            value={editedShop.name}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label
            htmlFor="address"
            className="text-sm font-medium text-[#262626]"
          >
            住所
          </Label>
          <Input
            id="address"
            name="address"
            value={editedShop.address}
            onChange={handleChange}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label
            htmlFor="google_review_url"
            className="text-sm font-medium text-[#262626]"
          >
            Google レビューURL
          </Label>
          <Input
            id="google_review_url"
            name="google_review_url"
            value={editedShop.google_review_url || ""}
            onChange={handleChange}
            className="mt-1"
            placeholder="Google マップのレビューURLを入力してください"
          />
        </div>
        <div>
          <Label
            htmlFor="business_type"
            className="text-sm font-medium text-[#262626]"
          >
            業種
          </Label>
          <Select
            onValueChange={handleBusinessTypeChange}
            value={editedShop.business_type}
          >
            <SelectTrigger className="w-full mt-1">
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
          <Label
            htmlFor="monthly_review_limit"
            className="text-sm font-medium text-[#262626]"
          >
            月間レビュー生成制限
          </Label>
          <Input
            id="monthly_review_limit"
            name="monthly_review_limit"
            type="number"
            value={editedShop.monthly_review_limit}
            onChange={handleChange}
            required
            min="1"
            className="mt-1"
          />
        </div>
        <div>
          <Label
            htmlFor="newEmail"
            className="text-sm font-medium text-[#262626]"
          >
            新しいメールアドレス（変更する場合）
          </Label>
          <Input
            id="newEmail"
            name="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label
            htmlFor="newPassword"
            className="text-sm font-medium text-[#262626]"
          >
            新しいパスワード（変更する場合）
          </Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          className="flex items-center"
          onClick={handleSurveySettingsNavigation}
        >
          <Settings className="w-4 h-4 mr-2" />
          アンケート設定
        </Button>
        <Button
          type="submit"
          className="bg-[#F2B705] hover:bg-[#F28705] text-[#262626]"
        >
          <Save className="w-4 h-4 mr-2" />
          更新
        </Button>
      </div>
    </form>
  );
}
