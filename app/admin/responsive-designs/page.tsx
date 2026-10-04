'use client'
import { useEffect, useState } from 'react'

export default function ResponsiveDesignsPage() {
  const [sets, setSets] = useState<any[]>([])
  const [themes, setThemes] = useState<any[]>([])
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', themeId: '', mobilePromptId: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/responsive-designs').then((r) => r.json()),
      fetch('/api/designs').then((r) => r.json()),
      fetch('/api/mobile-prompts').then((r) => r.json()),
    ]).then(([s, t, m]) => {
      setSets(s.sets || [])
      setThemes(t.themes || [])
      setPrompts(m.prompts || [])
      setLoading(false)
    })
  }, [])

  const handleCreate = async () => {
    if (!form.name) { alert('セット名を入力してください'); return }
    const res = await fetch('/api/responsive-designs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) { setSets((prev) => [data.set, ...prev]); setShowNew(false) }
  }

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📱 レスポンシブデザインライブラリ</h1>
          <p className="text-gray-500 text-sm">Desktop + Tablet + Mobile の組み合わせセット</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          ＋ 新しいセット
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-semibold mb-4">新しいResponsive Design Set</h2>
          <div className="grid gap-4">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="セット名（例: Modern Responsive）"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="説明"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600">Desktop テーマ</label>
                <select value={form.themeId} onChange={(e) => setForm({ ...form, themeId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">選択してください</option>
                  {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Mobile プロンプト</label>
                <select value={form.mobilePromptId} onChange={(e) => setForm({ ...form, mobilePromptId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">選択してください</option>
                  {prompts.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm">作成</button>
              <button onClick={() => setShowNew(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {sets.map((set) => (
          <div key={set.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-1">{set.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{set.description}</p>
            <div className="flex gap-2">
              {['Desktop', 'Tablet', 'Mobile'].map((d) => (
                <span key={d} className={`text-xs px-2 py-1 rounded-full ${
                  d === 'Desktop' ? 'bg-blue-100 text-blue-700' :
                  d === 'Tablet' ? 'bg-purple-100 text-purple-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {d === 'Desktop' ? '🖥' : d === 'Tablet' ? '📟' : '📱'} {d}
                </span>
              ))}
            </div>
            {set.theme && <p className="text-xs text-gray-400 mt-2">Theme: {set.theme.name}</p>}
            {set.mobilePrompt && <p className="text-xs text-gray-400">Mobile: {set.mobilePrompt.name}</p>}
          </div>
        ))}
        {!sets.length && (
          <div className="col-span-2 text-center py-12 text-gray-400">
            <p className="text-3xl mb-3">📱</p>
            <p>レスポンシブデザインセットがありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
