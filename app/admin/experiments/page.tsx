'use client'
import { useEffect, useState } from 'react'

interface Experiment {
  id: string
  name: string
  description: string
  status: string
  trafficSplit: number
  startDate: string | null
  endDate: string | null
  results: string
  winner: string | null
  site: { name: string }
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [sites, setSites] = useState<Array<{ id: string; name: string }>>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ siteId: '', name: '', description: '', trafficSplit: 0.5 })

  useEffect(() => {
    fetch('/api/sites').then((r) => r.json()).then((d) => setSites(d.sites || []))
    fetch('/api/experiments').then((r) => r.json()).then((d) => { setExperiments(d.experiments || []); setLoading(false) })
  }, [])

  const handleCreate = async () => {
    if (!form.siteId || !form.name) { alert('サイトと実験名を入力してください'); return }
    const res = await fetch('/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setExperiments((prev) => [data.experiment, ...prev])
    setShowNew(false)
    setForm({ siteId: '', name: '', description: '', trafficSplit: 0.5 })
  }

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/experiments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, startDate: status === 'RUNNING' ? new Date().toISOString() : undefined }),
    })
    setExperiments((prev) => prev.map((e) => e.id === id ? { ...e, status } : e))
  }

  const getResults = (exp: Experiment) => {
    try { return JSON.parse(exp.results) } catch { return {} }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">⚗️ A/Bテスト</h1>
          <p className="text-gray-500 text-sm">バリアントを比較してパフォーマンスを検証</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          ＋ 新しいテスト
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-semibold mb-4">新しいA/Bテスト</h2>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">サイト</label>
              <select value={form.siteId} onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">選択してください</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">実験名</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例: CTAボタンカラーテスト"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">説明</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">トラフィック配分 (Variant A: {Math.round(form.trafficSplit * 100)}%)</label>
              <input type="range" min="0.1" max="0.9" step="0.1" value={form.trafficSplit}
                onChange={(e) => setForm({ ...form, trafficSplit: parseFloat(e.target.value) })}
                className="w-full mt-1" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">作成</button>
              <button onClick={() => setShowNew(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="text-gray-500">読み込み中...</div> : (
        <div className="space-y-4">
          {experiments.map((exp) => {
            const results = getResults(exp)
            const hasEnoughData = results.totalPv > 100
            return (
              <div key={exp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{exp.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        exp.status === 'RUNNING' ? 'bg-green-100 text-green-700' :
                        exp.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{exp.status === 'RUNNING' ? '実行中' : exp.status === 'COMPLETED' ? '完了' : '下書き'}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">サイト: {exp.site?.name}</p>
                    {exp.description && <p className="text-sm text-gray-600 mb-3">{exp.description}</p>}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-900 mb-1">Version A ({Math.round(exp.trafficSplit * 100)}%)</p>
                        {results.variantA ? (
                          <div className="text-xs text-blue-700 space-y-0.5">
                            <p>PV: {results.variantA.pv || 0}</p>
                            <p>CTR: {results.variantA.ctr || '0'}%</p>
                            <p>CVR: {results.variantA.cvr || '0'}%</p>
                          </div>
                        ) : <p className="text-xs text-blue-400">データなし</p>}
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-purple-900 mb-1">Version B ({Math.round((1 - exp.trafficSplit) * 100)}%)</p>
                        {results.variantB ? (
                          <div className="text-xs text-purple-700 space-y-0.5">
                            <p>PV: {results.variantB.pv || 0}</p>
                            <p>CTR: {results.variantB.ctr || '0'}%</p>
                            <p>CVR: {results.variantB.cvr || '0'}%</p>
                          </div>
                        ) : <p className="text-xs text-purple-400">データなし</p>}
                      </div>
                    </div>

                    {!hasEnoughData && (
                      <p className="text-xs text-amber-600 mt-2">⚠ 判断にはデータ不足です（100PV以上必要）</p>
                    )}
                    {exp.winner && (
                      <p className="text-xs text-green-700 mt-2">🏆 Winner: {exp.winner}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {exp.status === 'DRAFT' && (
                      <button onClick={() => handleStatusChange(exp.id, 'RUNNING')}
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-xs">開始</button>
                    )}
                    {exp.status === 'RUNNING' && (
                      <button onClick={() => handleStatusChange(exp.id, 'COMPLETED')}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs">完了</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {!experiments.length && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-3">⚗️</p>
              <p>A/Bテストがありません</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
