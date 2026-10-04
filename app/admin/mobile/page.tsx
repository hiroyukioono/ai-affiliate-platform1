'use client'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MobileData {
  mobile: {
    pageViews: number; visits: number; clicks: number;
    conversions: number; revenue: number; ctr: string; cvr: string
  }
  desktop: { pageViews: number; clicks: number; ctr: string }
  issues: Array<{ severity: string; component: string; message: string }>
  daily: Array<{ date: string; pageViews: number; clicks: number }>
}

export default function MobileDashboardPage() {
  const [data, setData] = useState<MobileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<any | null>(null)
  const [sites, setSites] = useState<Array<{ id: string; name: string }>>([])
  const [selectedSite, setSelectedSite] = useState('')

  useEffect(() => {
    fetch('/api/sites').then((r) => r.json()).then((d) => {
      setSites(d.sites || [])
    })
    fetch('/api/analytics/mobile').then((r) => r.json()).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  const handleSiteChange = (siteId: string) => {
    setSelectedSite(siteId)
    setLoading(true)
    fetch(`/api/analytics/mobile?siteId=${siteId}`).then((r) => r.json()).then((d) => {
      setData(d)
      setLoading(false)
    })
  }

  const handleMobileCheck = async () => {
    if (!selectedSite) { alert('サイトを選択してください'); return }
    setChecking(true)
    const res = await fetch('/api/mobile-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId: selectedSite }),
    })
    const result = await res.json()
    setCheckResult(result.result)
    setChecking(false)
  }

  const chartData = data?.daily
    .filter((_, i) => i % 3 === 0)
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      PV: d.pageViews,
      クリック: d.clicks,
    })) || []

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📲 モバイル最適化</h1>
          <p className="text-gray-500 text-sm">スマートフォンのパフォーマンスを分析・改善</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedSite}
            onChange={(e) => handleSiteChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">全サイト</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button
            onClick={handleMobileCheck}
            disabled={checking || !selectedSite}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {checking ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                チェック中...
              </span>
            ) : '🤖 AIモバイルチェック'}
          </button>
        </div>
      </div>

      {/* Mobile KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mobile PV', value: (data?.mobile.pageViews || 0).toLocaleString(), icon: '📱' },
          { label: 'Mobile CTR', value: `${data?.mobile.ctr || 0}%`, icon: '📈' },
          { label: 'Mobile CV', value: data?.mobile.conversions || 0, icon: '🎯' },
          { label: 'Mobile 収益', value: `¥${(data?.mobile.revenue || 0).toLocaleString()}`, icon: '💰' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{kpi.label}</span>
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Desktop vs Mobile comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold mb-4">Desktop vs Mobile 比較</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Desktop CTR</p>
            <p className="text-3xl font-bold text-blue-600">{data?.desktop.ctr || 0}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Mobile CTR</p>
            <p className="text-3xl font-bold text-purple-600">{data?.mobile.ctr || 0}%</p>
          </div>
        </div>
        {data?.mobile.ctr && data?.desktop.ctr && parseFloat(data.mobile.ctr) < parseFloat(data.desktop.ctr) * 0.5 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            ⚠️ スマートフォンのCTRがデスクトップの50%以下です。モバイル最適化を検討してください。
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold mb-4">モバイルアクセス推移</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="PV" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="クリック" stroke="#EC4899" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Mobile Issues */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold mb-4">MOBILE ISSUES</h2>
        {data?.issues.length ? (
          <div className="space-y-3">
            {data.issues.map((issue, i) => (
              <div key={i} className={`p-4 rounded-lg border ${
                issue.severity === 'ERROR' ? 'bg-red-50 border-red-200' :
                issue.severity === 'WARNING' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{issue.severity === 'ERROR' ? '🔴' : issue.severity === 'WARNING' ? '🟡' : '🟢'}</span>
                  <span className="font-medium text-sm">{issue.component}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    issue.severity === 'ERROR' ? 'bg-red-100 text-red-700' :
                    issue.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{issue.severity}</span>
                </div>
                <p className="text-sm text-gray-700">{issue.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">✅</p>
            <p>現在検出された問題はありません</p>
          </div>
        )}
      </div>

      {/* AI Mobile Check Result */}
      {checkResult && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold mb-4">🤖 AI モバイルチェック結果</h2>

          {/* Checklist */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
            {Object.entries(checkResult.checklist || {}).map(([key, value]: [string, any]) => (
              <div key={key} className={`p-3 rounded-lg text-center text-sm ${
                value === 'PASS' ? 'bg-green-50 border border-green-200' :
                value === 'WARNING' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <p className="text-lg mb-1">
                  {value === 'PASS' ? '✓' : value === 'WARNING' ? '⚠' : '✕'}
                </p>
                <p className="font-medium text-xs">{key}</p>
                <p className={`text-xs ${
                  value === 'PASS' ? 'text-green-600' :
                  value === 'WARNING' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            {(checkResult.recommendations || []).map((rec: any, i: number) => (
              <div key={i} className={`p-4 rounded-lg border ${
                rec.priority === 'HIGH' ? 'border-red-200 bg-red-50' :
                rec.priority === 'MEDIUM' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    rec.priority === 'HIGH' ? 'bg-red-200 text-red-800' :
                    rec.priority === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>{rec.priority}</span>
                  <span className="font-semibold text-sm">{rec.component}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-1">問題: {rec.issue}</p>
                <p className="text-sm text-gray-600 mb-1">改善案: {rec.suggestion}</p>
                {rec.uncertainty && (
                  <p className="text-xs text-gray-400 mt-2">⚠ {rec.uncertainty}</p>
                )}
              </div>
            ))}
          </div>

          {checkResult.generalAdvice && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-1">💡 全体的なアドバイス</p>
              <p className="text-sm text-blue-700">{checkResult.generalAdvice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
