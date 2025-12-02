# Survey-Settings 実装修正ガイド

## 発生している問題

`Survey-AI/src/app/admin/survey-settings/[shopId]/page.tsx` ファイルにJSX構文エラーが発生しています。このエラーは主に以下の部分で発生しています：

```
Error: 
  × Unexpected token `div`. Expected jsx identifier
     ╭─[C:\Users\TSUCHIGA\Desktop\0412kuchikomi\Survey-AI\src\app\admin\survey-settings\[shopId]\page.tsx:654:1]
 654 │     .length;
 655 │ 
 656 │   return (
 657 │     <div className="flex flex-col min-h-screen bg-[#FFF9E5]">
     ·      ───
 658 │       <AdminHeader />
 659 │       <main className="flex-1 p-6 mt-16 overflow-auto">
 659 │         <motion.div
     ╰────
```

また、Draggableコンポーネント内での構文エラーも確認されています：

```
This JSX tag's 'children' prop expects a single child of type 'DraggableChildrenFn', but multiple children were provided.
```

## 修正方法

このファイルのJSX構文を修正するために、以下の手順を実行してください：

1. page.tsxファイルのバックアップを作成する
2. 以下の部分を修正する：
   - Draggableコンポーネントの子要素は単一の関数である必要がある
   - JSX要素の閉じタグが正しく配置されているか確認する
   - DragDropContextとDroppableコンポーネントが正しく入れ子になっているか確認する

## カラーとロゴの設定に関するSQLクエリ

カラーとロゴの設定に関するSQLクエリは以下の通りです：

```sql
ALTER TABLE survey_settings
ADD COLUMN primary_color TEXT DEFAULT '#F2B705',
ADD COLUMN secondary_color TEXT DEFAULT '#FFF9E5',
ADD COLUMN accent_color TEXT DEFAULT '#F28705',
ADD COLUMN text_color TEXT DEFAULT '#262626',
ADD COLUMN logo_url TEXT;
```

## 実装の注意点

1. survey-settings画面での実装エラーが修正されるまでは、以下の画面でのキーカラー反映を確認してください：
   - survey/[shopId]/page.tsx
   - review-confirmation/page.tsx
   - components/review-confirmation.tsx

2. カラーピッカーライブラリのインストールとインポート：
   ```bash
   npm install react-colorful
   ```
   ```jsx
   import { HexColorPicker } from "react-colorful";
   ```

3. デフォルト値の設定：
   - primary_color: "#F2B705"
   - secondary_color: "#FFF9E5"
   - accent_color: "#F28705"
   - text_color: "#262626" 