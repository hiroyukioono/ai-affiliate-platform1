'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  totals: { pageViews: number; visits: number; clicks: number; conversions: number; revenue: number; ctr: string; cvr: string }
  analytics: Array<{ date: string; pageViews: number; clicks: number; revenue: number }>
}

interface SiteData {
  sites: Array<{ id: string; name: string; status: string; affiliateTitle: string; _count: { pages: number } }>
}

interface RecoData {
  recommendations: Array<{ id: string; type: string; title: string; status: string; priority: number }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [siteData, setSiteData] = useState<SiteData | null>(null)
  const [recoData, setRecoData] = useState<RecoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((r) => r.json()),
      fetch('/api/sites').then((r) => r.json()),
      fetch('/api/recommendations?status=PENDING').then((r) => r.json()),
    ]).then(([a, s, r]) => {
      setStats(a)
      setSiteData(s)
      setRecoData(r)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  const chartData = stats?.analytics
    .filter((_, i) => i % 3 === 0)
    .map((a) => ({
      date: new Date(a.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      PV: a.pageViews,
      クリック: a.clicks,
      収益: Math.round(a.revenue / 1000),
    })) || []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-500 text-sm">AI Affiliate Platform 管理画面</p>
        </div>
        <Link
          href="/admin/sites/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          ＋ 新しいサイトを作成
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ページビュー', value: (stats?.totals.pageViews || 0).toLocaleString(), icon: '👁️', color: 'blue' },
          { label: 'クリック数', value: (stats?.totals.clicks || 0).toLocaleString(), icon: '🖱️', color: 'green' },
          { label: 'CTR', value: `${stats?.totals.ctr || 0}%`, icon: '📈', color: 'purple' },
          { label: '収益', value: `¥${(stats?.totals.revenue || 0).toLocaleString()}`, icon: '💰', color: 'yellow' },
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

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">30日間のアクセス推移</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="PV" stroke="#3B82F6" fill="url(#pvGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sites */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">管理サイト</h2>
            <Link href="/admin/sites" className="text-blue-600 text-sm hover:underline">すべて見る</Link>
          </div>
          <div className="space-y-3">
            {siteData?.sites.slice(0, 5).map((site) => (
              <div key={site.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{site.name}</p>
                  <p className="text-xs text-gray-500">{site.affiliateTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    site.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {site.status === 'PUBLISHED' ? '公開中' : '下書き'}
                  </span>
                  <Link href={`/admin/sites/${site.id}`} className="text-blue-600 text-xs hover:underline">編集</Link>
                </div>
              </div>
            ))}
            {(!siteData?.sites.length) && (
              <p className="text-gray-400 text-sm text-center py-4">サイトがありません</p>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">AI改善提案</h2>
            <Link href="/admin/recommendations" className="text-blue-600 text-sm hover:underline">すべて見る</Link>
          </div>
          <div className="space-y-3">
            {recoData?.recommendations.slice(0, 5).map((rec) => (
              <div key={rec.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    rec.type === 'MOBILE' ? 'bg-purple-100 text-purple-700' :
                    rec.type === 'SEO' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {rec.type}
                  </span>
                  <span className="text-xs text-gray-400">優先度: {rec.priority}</span>
                </div>
                <p className="text-sm text-gray-900">{rec.title}</p>
              </div>
            ))}
            {(!recoData?.recommendations.length) && (
              <p className="text-gray-400 text-sm text-center py-4">AI提案はありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
