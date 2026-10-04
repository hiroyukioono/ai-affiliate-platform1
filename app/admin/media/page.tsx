'use client'
import { useEffect, useState } from 'react'

interface MediaFile { id: string; name: string; url: string; type: string; size: number; alt: string; createdAt: string }

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', type: 'image', alt: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/media').then((r) => r.json()).then((d) => { setFiles(d.files || []); setLoading(false) })
  }, [])

  const handleAdd = async () => {
    if (!form.name || !form.url) { alert('名前とURLを入力してください'); return }
    setSaving(true)
    const res = await fetch('/api/media', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) { setFiles((prev) => [data.file, ...prev]); setShowAdd(false); setForm({ name: '', url: '', type: 'image', alt: '' }) }
    setSaving(false)
  }

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🖼️ メディア管理</h1>
          <p className="text-gray-500 text-sm">{files.length}件のファイル</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          ＋ メディア追加
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-semibold mb-4">メディアを追加（URL指定）</h2>
          <div className="grid gap-3">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="ファイル名" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="画像URL（https://...）" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })}
              placeholder="代替テキスト（alt）" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            {form.url && (
              <div className="rounded-lg overflow-hidden border h-32">
                <img src={form.url} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 bg-blue-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm">
                {saving ? '追加中...' : '追加'}
              </button>
              <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {files.map((file) => (
          <div key={file.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-28 bg-gray-100">
              <img src={file.url} alt={file.alt || file.name} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x112?text=Error' }} />
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{new Date(file.createdAt).toLocaleDateString('ja-JP')}</p>
            </div>
          </div>
        ))}
        {!files.length && (
          <div className="col-span-5 text-center py-12 text-gray-400">
            <p className="text-3xl mb-3">🖼️</p>
            <p>メディアがありません。URLを指定して追加してください。</p>
          </div>
        )}
      </div>
    </div>
  )
}
