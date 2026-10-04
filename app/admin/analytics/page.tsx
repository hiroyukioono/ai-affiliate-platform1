'use client'
import { useEffect, useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  totals: { pageViews: number; visits: number; clicks: number; conversions: number; revenue: number; ctr: string; cvr: string }
  analytics: Array<{ date: string; device: string; pageViews: number; clicks: number; conversions: number; revenue: number }>
  deviceBreakdown: Array<{ device: string; _sum: { pageViews: number; clicks: number; revenue: number } }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [device, setDevice] = useState('ALL')
  const [sites, setSites] = useState<Array<{ id: string; name: string }>>([])
  const [selectedSite, setSelectedSite] = useState('')

  const loadData = (d = days, dv = device, site = selectedSite) => {
    setLoading(true)
    const params = new URLSearchParams({ days: String(d), device: dv })
    if (site) params.set('siteId', site)
    fetch(`/api/analytics?${params}`)
      .then((r) => r.json())
      .then((res) => { setData(res); setLoading(false) })
  }

  useEffect(() => {
    fetch('/api/sites').then((r) => r.json()).then((d) => setSites(d.sites || []))
    loadData()
  }, [])

  const chartData = (data?.analytics || [])
    .reduce((acc: any[], row) => {
      const dateStr = new Date(row.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
      const existing = acc.find((a) => a.date === dateStr)
      if (existing) {
        existing.PV += row.pageViews
        existing.クリック += row.clicks
        existing.収益 = Math.round((existing.収益 || 0) + row.revenue / 1000)
      } else {
        acc.push({ date: dateStr, PV: row.pageViews, クリック: row.clicks, 収益: Math.round(row.revenue / 1000) })
      }
      return acc
    }, [])
    .filter((_, i) => i % 2 === 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">アクセス分析</h1>
          <p className="text-gray-500 text-sm">サイトのパフォーマンスを詳細分析</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={selectedSite} onChange={(e) => { setSelectedSite(e.target.value); loadData(days, device, e.target.value) }}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">全サイト</option>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={device} onChange={(e) => { setDevice(e.target.value); loadData(days, e.target.value) }}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="ALL">全デバイス</option>
            <option value="DESKTOP">Desktop</option>
            <option value="MOBILE">Mobile</option>
            <option value="TABLET">Tablet</option>
          </select>
          <select value={days} onChange={(e) => { setDays(Number(e.target.value)); loadData(Number(e.target.value), device) }}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value={7}>7日間</option>
            <option value={30}>30日間</option>
            <option value={90}>90日間</option>
          </select>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ページビュー', value: (data?.totals.pageViews || 0).toLocaleString(), sub: `訪問: ${(data?.totals.visits || 0).toLocaleString()}` },
          { label: 'クリック数', value: (data?.totals.clicks || 0).toLocaleString(), sub: `CTR: ${data?.totals.ctr || 0}%` },
          { label: 'コンバージョン', value: (data?.totals.conversions || 0).toLocaleString(), sub: `CVR: ${data?.totals.cvr || 0}%` },
          { label: '収益', value: `¥${(data?.totals.revenue || 0).toLocaleString()}`, sub: '累計' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold mb-4">アクセス推移</h2>
        {loading ? (
          <div className="h-52 flex items-center justify-center text-gray-400">読み込み中...</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="pvG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="PV" stroke="#3B82F6" fill="url(#pvG)" />
              <Area type="monotone" dataKey="クリック" stroke="#10B981" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Device breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold mb-4">デバイス別パフォーマンス</h2>
        <div className="grid grid-cols-3 gap-4">
          {(data?.deviceBreakdown || []).map((d) => {
            const pv = d._sum.pageViews || 0
            const clicks = d._sum.clicks || 0
            const ctr = pv > 0 ? ((clicks / pv) * 100).toFixed(1) : '0'
            const icon = d.device === 'MOBILE' ? '📱' : d.device === 'TABLET' ? '📟' : '🖥'
            return (
              <div key={d.device} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">{icon} {d.device}</p>
                <p className="text-xl font-bold text-gray-900">{pv.toLocaleString()} <span className="text-xs text-gray-400">PV</span></p>
                <p className="text-sm text-gray-500 mt-1">CTR: {ctr}%</p>
                <p className="text-sm text-gray-500">収益: ¥{(d._sum.revenue || 0).toLocaleString()}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
