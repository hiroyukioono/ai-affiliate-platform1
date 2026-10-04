'use client'
import { useEffect, useState } from 'react'

export default function AffiliateLinksPage() {
  const [links, setLinks] = useState<any[]>([])
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ siteId: '', name: '', originalUrl: '', trackingUrl: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/affiliate-links').then((r) => r.json()),
      fetch('/api/sites').then((r) => r.json()),
    ]).then(([l, s]) => { setLinks(l.links || []); setSites(s.sites || []); setLoading(false) })
  }, [])

  const handleCreate = async () => {
    if (!form.siteId || !form.name || !form.originalUrl) { alert('必須項目を入力してください'); return }
    const res = await fetch('/api/affiliate-links', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) { setLinks((prev) => [data.link, ...prev]); setShowNew(false) }
  }

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔗 アフィリエイトリンク</h1>
          <p className="text-gray-500 text-sm">{links.length}件のリンク</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          ＋ 新しいリンク
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-semibold mb-4">新しいアフィリエイトリンク</h2>
          <div className="grid gap-3">
            <select value={form.siteId} onChange={(e) => setForm({ ...form, siteId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">サイトを選択</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="リンク名" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="url" value={form.originalUrl} onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              placeholder="元URL" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="url" value={form.trackingUrl} onChange={(e) => setForm({ ...form, trackingUrl: e.target.value })}
              placeholder="トラッキングURL（空の場合は元URLを使用）"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <div className="flex gap-3">
              <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm">作成</button>
              <button onClick={() => setShowNew(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900">{link.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${link.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {link.status === 'ACTIVE' ? 'アクティブ' : '無効'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">サイト: {link.site?.name}</p>
                <p className="text-xs text-gray-400 truncate max-w-xs">{link.trackingUrl}</p>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{link.clicks.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">クリック</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{link.conversions}</p>
                  <p className="text-xs text-gray-400">CV</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">¥{link.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">収益</p>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t flex items-center gap-2">
              <span className="text-xs text-gray-400">トラッキングURL:</span>
              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                /api/track/{link.id}
              </code>
            </div>
          </div>
        ))}
        {!links.length && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-3">🔗</p>
            <p>リンクがありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
