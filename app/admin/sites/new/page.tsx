'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Theme {
  id: string
  name: string
  description: string
  primaryColor: string
}

interface MobilePrompt {
  id: string
  name: string
  description: string
}

export default function NewSitePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [themes, setThemes] = useState<Theme[]>([])
  const [mobilePrompts, setMobilePrompts] = useState<MobilePrompt[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [createdSiteId, setCreatedSiteId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    affiliateTitle: '',
    description: '',
    affiliateUrl: '',
    themeId: '',
    mobilePromptId: '',
  })

  const loadStep2Data = async () => {
    const [t, m] = await Promise.all([
      fetch('/api/designs').then((r) => r.json()),
      fetch('/api/mobile-prompts').then((r) => r.json()),
    ])
    setThemes(t.themes || [])
    setMobilePrompts(m.prompts || [])
  }

  const handleNext = async () => {
    if (step === 1) {
      if (!form.name || !form.affiliateTitle) {
        alert('サイト名とアフィリエイトタイトルを入力してください')
        return
      }
      await loadStep2Data()
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      await handleCreate()
    }
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCreatedSiteId(data.site.id)
      setStep(4)
    } catch (e: any) {
      alert('エラー: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!createdSiteId) return
    setGenerating(true)
    try {
      const res = await fetch(`/api/sites/${createdSiteId}/generate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuggestions(data.suggestions || [])
      setStep(5)
    } catch (e: any) {
      alert('生成エラー: ' + e.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">新しいサイトを作成</h1>
        <p className="text-gray-500 text-sm">AIがアフィリエイトサイトを自動生成します</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {['基本情報', 'デザイン', 'モバイル', '作成', 'AI生成'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step > i + 1 ? 'bg-green-500 text-white' :
              step === i + 1 ? 'bg-blue-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step === i + 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < 4 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">基本情報を入力</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">サイト名 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例: クレジットカード比較メディア"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">アフィリエイトタイトル *</label>
              <input
                type="text"
                value={form.affiliateTitle}
                onChange={(e) => setForm({ ...form, affiliateTitle: e.target.value })}
                placeholder="例: おすすめクレジットカード比較2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">AIがこのタイトルを元にコンテンツを生成します</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">サイト説明</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="サイトの概要・ターゲット読者・特徴など"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">アフィリエイトURL</label>
              <input
                type="url"
                value={form.affiliateUrl}
                onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })}
                placeholder="https://example.com/affiliate"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Design */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">デザインテーマを選択</h2>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => setForm({ ...form, themeId: theme.id })}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                    form.themeId === theme.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="h-8 rounded-lg mb-2" style={{ backgroundColor: theme.primaryColor }} />
                  <p className="font-medium text-sm">{theme.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Mobile */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">スマートフォン最適化プロンプトを選択</h2>
            <div className="grid gap-3">
              {mobilePrompts.map((mp) => (
                <div
                  key={mp.id}
                  onClick={() => setForm({ ...form, mobilePromptId: mp.id })}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                    form.mobilePromptId === mp.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📱</span>
                    <div>
                      <p className="font-medium text-sm">{mp.name}</p>
                      <p className="text-xs text-gray-500">{mp.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">サイトが作成されました！</h2>
            <p className="text-gray-500 mb-6">次にAIがコンテンツを自動生成します</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <p className="text-sm font-medium text-blue-900 mb-2">🤖 AIが以下を生成します：</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• SEO最適化されたメタタイトル・ディスクリプション</li>
                <li>• アフィリエイト記事コンテンツ</li>
                <li>• 比較ページ</li>
                <li>• CTAコンポーネント</li>
              </ul>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
            >
              {generating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI生成中...
                </span>
              ) : (
                '🚀 AIでコンテンツを生成する'
              )}
            </button>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">AIコンテンツ生成完了！</h2>
            <p className="text-gray-500 mb-4">サイトのコンテンツが生成されました</p>

            {suggestions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-6">
                <p className="text-sm font-medium text-yellow-900 mb-2">💡 AI改善提案：</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/admin/builder/${createdSiteId}`)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
              >
                🔧 サイトビルダーで編集
              </button>
              <button
                onClick={() => router.push('/admin/sites')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition"
              >
                サイト一覧へ
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                ← 戻る
              </button>
            ) : <div />}
            <button
              onClick={handleNext}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
            >
              {loading ? '処理中...' : step === 3 ? 'サイトを作成' : '次へ →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
