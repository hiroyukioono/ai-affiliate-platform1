'use client'
import { useEffect, useState } from 'react'

interface Recommendation {
  id: string
  type: string
  title: string
  description: string
  reasoning: string
  dataUsed: string
  uncertainty: string
  status: string
  priority: number
  createdAt: string
  site: { name: string }
}

const TYPE_COLORS: Record<string, string> = {
  MOBILE: 'bg-purple-100 text-purple-700',
  SEO: 'bg-blue-100 text-blue-700',
  CTA: 'bg-orange-100 text-orange-700',
  DESIGN: 'bg-pink-100 text-pink-700',
  CONTENT: 'bg-green-100 text-green-700',
  AFFILIATE: 'bg-yellow-100 text-yellow-700',
  CONVERSION: 'bg-red-100 text-red-700',
  REVENUE: 'bg-emerald-100 text-emerald-700',
}

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sites, setSites] = useState<Array<{ id: string; name: string }>>([])
  const [selectedSite, setSelectedSite] = useState('')
  const [filterStatus, setFilterStatus] = useState('PENDING')
  const [filterType, setFilterType] = useState('')

  const loadRecs = (status = filterStatus, type = filterType) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (type) params.set('type', type)
    fetch(`/api/recommendations?${params}`)
      .then((r) => r.json())
      .then((d) => { setRecs(d.recommendations || []); setLoading(false) })
  }

  useEffect(() => {
    fetch('/api/sites').then((r) => r.json()).then((d) => setSites(d.sites || []))
    loadRecs()
  }, [])

  const handleGenerate = async () => {
    if (!selectedSite) { alert('サイトを選択してください'); return }
    setGenerating(true)
    await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId: selectedSite }),
    })
    loadRecs()
    setGenerating(false)
  }

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT' | 'HOLD') => {
    await fetch(`/api/recommendations/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setRecs((prev) => prev.map((r) =>
      r.id === id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'HOLD' } : r
    ))
  }

  const pendingCount = recs.filter((r) => r.status === 'PENDING').length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🤖 AI改善提案</h1>
          <p className="text-gray-500 text-sm">AIが分析した改善候補を確認・承認</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">サイトを選択</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={handleGenerate} disabled={generating || !selectedSite}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
            {generating ? 'AI分析中...' : '🤖 AI分析を実行'}
          </button>
        </div>
      </div>

      {/* Pending count */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">⏳ {pendingCount}件の承認待き提案があります</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'HOLD'].map((s) => (
          <button key={s} onClick={() => { setFilterStatus(s); loadRecs(s, filterType) }}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s === '' ? '全て' : s === 'PENDING' ? '⏳ 承認待ち' : s === 'APPROVED' ? '✅ 承認済' : s === 'REJECTED' ? '❌ 却下' : '⏸ 保留'}
          </button>
        ))}
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); loadRecs(filterStatus, e.target.value) }}
          className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">全タイプ</option>
          {['MOBILE', 'SEO', 'CTA', 'DESIGN', 'CONTENT', 'AFFILIATE', 'CONVERSION', 'REVENUE'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500">読み込み中...</div>
      ) : (
        <div className="space-y-4">
          {recs.map((rec) => {
            let dataUsed: Record<string, any> = {}
            try { dataUsed = JSON.parse(rec.dataUsed || '{}') } catch {}
            return (
              <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[rec.type] || 'bg-gray-100 text-gray-600'}`}>
                        {rec.type}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        rec.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        rec.status === 'HOLD' ? 'bg-gray-100 text-gray-600' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {rec.status === 'PENDING' ? '承認待ち' : rec.status === 'APPROVED' ? '承認済' : rec.status === 'REJECTED' ? '却下' : '保留'}
                      </span>
                      <span className="text-xs text-gray-400">優先度: {rec.priority}</span>
                      <span className="text-xs text-gray-400">サイト: {rec.site?.name}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
                    <p className="text-sm text-gray-700 mb-3">{rec.description}</p>

                    {rec.reasoning && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-2">
                        <p className="text-xs font-medium text-blue-900 mb-1">📊 分析根拠</p>
                        <p className="text-xs text-blue-700">{rec.reasoning}</p>
                      </div>
                    )}

                    {Object.keys(dataUsed).length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-2">
                        <p className="text-xs font-medium text-gray-600 mb-1">使用データ</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(dataUsed).map(([k, v]) => (
                            <span key={k} className="text-xs bg-white border rounded px-2 py-0.5">
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {rec.uncertainty && (
                      <p className="text-xs text-amber-600">⚠ 不確実性: {rec.uncertainty}</p>
                    )}
                  </div>

                  {rec.status === 'PENDING' && (
                    <div className="flex flex-col gap-2 ml-4">
                      <button onClick={() => handleAction(rec.id, 'APPROVE')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium">
                        ✓ 採用
                      </button>
                      <button onClick={() => handleAction(rec.id, 'REJECT')}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-1.5 rounded-lg text-xs font-medium">
                        ✕ 却下
                      </button>
                      <button onClick={() => handleAction(rec.id, 'HOLD')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-medium">
                        ⏸ 保留
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {!recs.length && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-3">🤖</p>
              <p>AI提案がありません。サイトを選択してAI分析を実行してください。</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
