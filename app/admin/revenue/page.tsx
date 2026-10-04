'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function RevenuePage() {
  const [links, setLinks] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/affiliate-links').then((r) => r.json()),
      fetch('/api/analytics?days=30').then((r) => r.json()),
    ]).then(([l, a]) => {
      setLinks(l.links || [])
      setAnalytics(a)
      setLoading(false)
    })
  }, [])

  const totalRevenue = links.reduce((sum, l) => sum + l.revenue, 0)
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0)
  const totalCvs = links.reduce((sum, l) => sum + l.conversions, 0)

  const chartData = links.slice(0, 8).map((l) => ({
    name: l.name.substring(0, 15),
    収益: Math.round(l.revenue),
    クリック: l.clicks,
  }))

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">💰 成果・収益分析</h1>
        <p className="text-gray-500 text-sm">アフィリエイト収益の詳細レポート</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '総収益', value: `¥${totalRevenue.toLocaleString()}`, icon: '💰' },
          { label: '総クリック', value: totalClicks.toLocaleString(), icon: '🖱️' },
          { label: '総コンバージョン', value: totalCvs.toLocaleString(), icon: '✅' },
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

      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold mb-4">広告リンク別収益</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="収益" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold mb-4">アフィリエイトリンク一覧</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 text-gray-500 font-medium">リンク名</th>
                <th className="pb-3 text-gray-500 font-medium">サイト</th>
                <th className="pb-3 text-gray-500 font-medium text-right">クリック</th>
                <th className="pb-3 text-gray-500 font-medium text-right">CV</th>
                <th className="pb-3 text-gray-500 font-medium text-right">CVR</th>
                <th className="pb-3 text-gray-500 font-medium text-right">収益</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => {
                const cvr = link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : '0'
                return (
                  <tr key={link.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{link.name}</td>
                    <td className="py-3 text-gray-500">{link.site?.name}</td>
                    <td className="py-3 text-right">{link.clicks.toLocaleString()}</td>
                    <td className="py-3 text-right">{link.conversions}</td>
                    <td className="py-3 text-right">{cvr}%</td>
                    <td className="py-3 text-right font-medium text-green-600">¥{link.revenue.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!links.length && <p className="text-center py-8 text-gray-400">リンクがありません</p>}
        </div>
      </div>
    </div>
  )
}
