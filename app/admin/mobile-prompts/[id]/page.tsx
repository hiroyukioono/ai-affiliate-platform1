'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Prompt {
  id: string
  name: string
  description: string
  prompt: string
  targetDevice: string
  priority: number
  status: string
  versions: Array<{ id: string; version: number; name: string; prompt_content: string; createdAt: string }>
}

export default function EditMobilePromptPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [form, setForm] = useState<Partial<Prompt>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null)
  const [showVersions, setShowVersions] = useState(false)

  useEffect(() => {
    fetch(`/api/mobile-prompts/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setPrompt(d.prompt)
        setForm(d.prompt)
        setLoading(false)
      })
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/mobile-prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, prompt: optimizedPrompt || form.prompt }),
    })
    if (res.ok) {
      const data = await res.json()
      setPrompt(data.prompt)
      setForm(data.prompt)
      setOptimizedPrompt(null)
      alert('保存しました')
    }
    setSaving(false)
  }

  const handleAiOptimize = async () => {
    setOptimizing(true)
    try {
      const res = await fetch(`/api/mobile-prompts/${id}/ai-optimize`, { method: 'POST' })
      const data = await res.json()
      setOptimizedPrompt(data.optimizedPrompt)
    } catch (e: any) {
      alert('最適化エラー: ' + e.message)
    } finally {
      setOptimizing(false)
    }
  }

  const handleRollback = async (versionId: string) => {
    if (!confirm('このバージョンに戻しますか？')) return
    const res = await fetch(`/api/mobile-prompts/${id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId }),
    })
    if (res.ok) {
      const data = await res.json()
      setForm(data.prompt)
      setPrompt(data.prompt)
      alert('ロールバックしました')
      window.location.reload()
    }
  }

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>
  if (!prompt) return <div className="p-6 text-red-500">プロンプトが見つかりません</div>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">プロンプト編集</h1>
          <p className="text-gray-500 text-sm">{prompt.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm"
          >
            📜 バージョン履歴
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* Version History */}
      {showVersions && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">バージョン履歴</h2>
          <div className="space-y-2">
            {prompt.versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium">Version {v.version}</span>
                  <span className="text-xs text-gray-400 ml-2">{new Date(v.createdAt).toLocaleString('ja-JP')}</span>
                </div>
                <button
                  onClick={() => handleRollback(v.id)}
                  className="text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-2 py-1 rounded"
                >
                  このバージョンに戻す
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Prompt Name</label>
          <input
            type="text"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">対象デバイス</label>
            <select
              value={form.targetDevice || 'MOBILE'}
              onChange={(e) => setForm({ ...form, targetDevice: e.target.value })}
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
              value={form.priority ?? 0}
              onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ステータス</label>
            <select
              value={form.status || 'ACTIVE'}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Design Prompt</label>
          <textarea
            value={form.prompt || ''}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
          />
        </div>

        {optimizedPrompt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">🤖 AI最適化結果</p>
              <button onClick={() => setOptimizedPrompt(null)} className="text-xs text-blue-600 hover:underline">閉じる</button>
            </div>
            <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono">{optimizedPrompt}</pre>
            <button
              onClick={() => { setForm({ ...form, prompt: optimizedPrompt }); setOptimizedPrompt(null) }}
              className="mt-3 text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
            >
              このプロンプトを使用
            </button>
          </div>
        )}

        <div className="flex gap-3">
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
