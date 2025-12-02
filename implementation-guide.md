# キーカラーとロゴの設定対応実装手順書

## 概要

survey/[shopId]/page.tsx画面、review-confirmation/page.tsx画面、components/review-confirmation.tsx画面のキーカラーをsurvey-settings画面で設定して反映できるようにします。また、review-confirmation/page.tsx画面とcomponents/review-confirmation.tsx画面のロゴも設定できるようにします。

## 必要な変更

### 1. データベーススキーマの変更

survey_settingsテーブルに以下のフィールドを追加します:

- `primary_color`: アプリのプライマリカラー（ヘッダー、ボタンなど）
- `secondary_color`: アプリのセカンダリカラー（背景色など）
- `accent_color`: アクセントカラー（アイコン、強調部分など）
- `text_color`: テキストカラー
- `logo_url`: レビュー確認画面に表示するロゴ画像のURL

### 2. 修正が必要なファイル

#### 2.1 インターフェース定義の修正

以下のファイル内のインターフェース定義を更新します:

- `app/admin/survey-settings/[shopId]/page.tsx`
- `app/survey/[shopId]/page.tsx`
- `app/review-confirmation/page.tsx`
- `components/review-confirmation.tsx`

#### 2.2 Survey-Settings 画面の修正

`app/admin/survey-settings/[shopId]/page.tsx` に以下の機能を追加:

- キーカラー設定用のカラーピッカーUI
- ロゴアップロード機能（既存の画像アップロード機能を拡張）
- カラープレビュー機能

#### 2.3 アンケート画面の修正

`app/survey/[shopId]/page.tsx` に以下の修正:

- 設定されたカラーを取得して適用するロジックの追加
- ハードコードされたカラーコードを動的な変数に変更

#### 2.4 レビュー確認画面の修正

`app/review-confirmation/page.tsx` と `components/review-confirmation.tsx` に以下の修正:

- 設定されたカラーを取得して適用するロジックの追加
- ロゴ画像を取得して表示するロジックの追加
- ハードコードされたカラーコードを動的な変数に変更

#### 2.5 API の修正

カラー設定とロゴを保存・取得するためのAPIエンドポイントを修正:

- `app/api/admin/survey-settings/route.ts`
- `app/api/admin/upload-logo/route.ts` (必要に応じて新規作成)

### 3. 実装ステップ

#### 3.1 データベーススキーマ変更

1. Supabaseダッシュボードでsurvey_settingsテーブルに新しいカラムを追加
   - `primary_color` (text型、デフォルト: "#F2B705")
   - `secondary_color` (text型、デフォルト: "#FFF9E5")
   - `accent_color` (text型、デフォルト: "#F28705")
   - `text_color` (text型、デフォルト: "#262626")
   - `logo_url` (text型、NULL許容)

#### 3.2 インターフェース定義更新

SurveySettings インターフェースに新しいフィールドを追加:

```typescript
interface SurveySettings {
  // 既存のフィールド
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  logo_url: string | null;
}
```

#### 3.3 Survey-Settings 画面の修正

1. カラーピッカーコンポーネントの追加
2. ロゴアップロード機能の追加
3. デフォルト値の設定
4. プレビュー機能の実装

#### 3.4 アプリケーションへのカラー適用

1. CSS変数またはスタイル適用ロジックの実装
2. 各画面でのカラー取得・適用処理の追加

#### 3.5 ロゴ表示機能の実装

1. レビュー確認画面でのロゴ表示処理の追加
2. デフォルトロゴのフォールバック設定

### 4. テスト項目

- survey-settings画面でのカラー設定が正しく保存されるか
- 設定したカラーがアンケート画面に反映されるか
- 設定したカラーがレビュー確認画面に反映されるか
- ロゴがレビュー確認画面に正しく表示されるか
- デフォルト値が正しく適用されるか

### 5. 注意点

- カラー設定のバリデーション（有効なカラーコードかチェック）
- コントラスト比の考慮（アクセシビリティ）
- ロゴのサイズ制限とリサイズ処理
- 既存のハードコードされたスタイルの置き換え漏れがないか確認
