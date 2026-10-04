'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewMobilePromptPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    description: '',
    prompt: '',
    targetDevice: 'MOBILE' as 'MOBILE' | 'TABLET' | 'ALL',
    priority: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  })
  const [saving, setSaving] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [optimized, setOptimized] = useState<string | null>(null)

  const handleSave = async () => {
    if (!form.name || !form.prompt) {
      alert('プロンプト名とプロンプトを入力してください')
      return
    }
    setSaving(true)
    const res = await fetch('/api/mobile-prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, prompt: optimized || form.prompt }),
    })
    if (res.ok) {
      router.push('/admin/mobile-prompts')
    } else {
      const d = await res.json()
      alert('エラー: ' + d.error)
    }
    setSaving(false)
  }

  const handleAiOptimize = async () => {
    if (!form.prompt) { alert('プロンプトを入力してください'); return }
    setOptimizing(true)
    try {
      // Create temp prompt to optimize
      const tempRes = await fetch('/api/mobile-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, name: '__temp__', status: 'INACTIVE' }),
      })
      if (tempRes.ok) {
        const tempData = await tempRes.json()
        const optRes = await fetch(`/api/mobile-prompts/${tempData.prompt.id}/ai-optimize`, { method: 'POST' })
        const optData = await optRes.json()
        setOptimized(optData.optimizedPrompt)
        // Delete temp
        await fetch(`/api/mobile-prompts/${tempData.prompt.id}`, { method: 'DELETE' })
      }
    } catch (e: any) {
      alert('最適化エラー: ' + e.message)
    } finally {
      setOptimizing(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">NEW MOBILE DESIGN PROMPT</h1>
        <p className="text-gray-500 text-sm">スマートフォン最適化プロンプトを新規作成</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Prompt Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="例: Mobile Standard"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="プロンプトの説明"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">対象デバイス</label>
            <select
              value={form.targetDevice}
              onChange={(e) => setForm({ ...form, targetDevice: e.target.value as any })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="MOBILE">MOBILE</option>
              <option value="TABLET">TABLET</option>
              <option value="ALL">ALL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">優先度</label>
            <input
              type="number"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ステータス</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Design Prompt *</label>
          <textarea
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            rows={12}
            placeholder={`スマートフォンでは、
1カラムレイアウトを使用。

本文は読みやすい文字サイズにする。

CTAは画面幅に合わせ、
タップしやすいサイズにする。

比較表は横スクロール可能にする。

画像は最大幅100%にする。

横スクロールを発生させない。

広告はコンテンツを邪魔しない。`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
          />
        </div>

        {optimized && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">🤖 AI最適化結果</p>
              <button
                onClick={() => setOptimized(null)}
                className="text-xs text-blue-600 hover:underline"
              >
                元に戻す
              </button>
            </div>
            <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono">{optimized}</pre>
            <button
              onClick={() => setForm({ ...form, prompt: optimized })}
              className="mt-3 text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
            >
              このプロンプトを使用
            </button>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleAiOptimize}
            disabled={optimizing}
            className="flex-1 bg-purple-100 hover:bg-purple-200 disabled:opacity-50 text-purple-700 font-medium py-3 rounded-lg transition"
          >
            {optimizing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                AI最適化中...
              </span>
            ) : '🤖 AIで最適化'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {saving ? '保存中...' : '💾 保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
