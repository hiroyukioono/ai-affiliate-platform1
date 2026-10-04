'use client'
import { useState } from 'react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">⚙️ 設定</h1>
        <p className="text-gray-500 text-sm">システム設定</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">OpenAI API設定</h2>
          <div>
            <label className="text-sm font-medium text-gray-700">APIキー（.envファイルで設定）</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 font-mono">
              OPENAI_API_KEY=your-api-key-here
            </div>
            <p className="text-xs text-gray-400 mt-1">APIキーは.envファイルで設定してください。管理画面には表示されません。</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">セキュリティ</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>XSS対策（入力値サニタイズ）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>CSRF対策（NextAuth セッション）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>SQLインジェクション対策（Prisma ORM）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>権限管理（セッション認証）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>入力値検証（Zod）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>監査ログ（AuditLog テーブル）</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">データベース</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>データベース: SQLite（Prisma ORM）</p>
            <p>場所: ./prisma/dev.db</p>
            <p className="text-xs text-gray-400 mt-2">本番環境ではPostgreSQLへの移行を推奨します。</p>
          </div>
          <div className="mt-3">
            <code className="text-xs bg-gray-100 px-3 py-2 rounded block">npx prisma studio</code>
            <p className="text-xs text-gray-400 mt-1">上記コマンドでDBブラウザを開けます</p>
          </div>
        </div>
      </div>
    </div>
  )
}
