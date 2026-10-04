'use client'
import { useEffect, useState } from 'react'

interface Theme {
  id: string
  name: string
  description: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  status: string
  isDefault: boolean
  _count: { sites: number }
}

export default function DesignsPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF', fontFamily: "'Noto Sans JP', sans-serif",
  })

  useEffect(() => {
    fetch('/api/designs').then((r) => r.json()).then((d) => { setThemes(d.themes || []); setLoading(false) })
  }, [])

  const handleCreate = async () => {
    if (!form.name) { alert('テーマ名を入力してください'); return }
    const res = await fetch('/api/designs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) { setThemes((prev) => [...prev, data.theme]); setShowNew(false) }
  }

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎨 デザインテーマ</h1>
          <p className="text-gray-500 text-sm">{themes.length}件のテーマ</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          ＋ 新しいテーマ
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-semibold mb-4">新しいデザインテーマ</h2>
          <div className="grid gap-4">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="テーマ名" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="説明" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600">メインカラー</label>
                <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-full mt-1 h-10 border rounded-lg cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-gray-600">サブカラー</label>
                <input type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-full mt-1 h-10 border rounded-lg cursor-pointer" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm">作成</button>
              <button onClick={() => setShowNew(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div key={theme.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-20" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }} />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                {theme.isDefault && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">デフォルト</span>}
              </div>
              <p className="text-xs text-gray-500 mb-2">{theme.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>使用サイト: {theme._count.sites}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
