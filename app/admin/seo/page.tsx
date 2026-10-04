'use client'
import { useEffect, useState } from 'react'

export default function SeoPage() {
  const [sites, setSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sites').then((r) => r.json()).then((d) => { setSites(d.sites || []); setLoading(false) })
  }, [])

  const getScore = (site: any) => {
    let score = 0
    if (site.metaTitle) score += 20
    if (site.metaDescription) score += 20
    if (site.metaKeywords) score += 10
    if (site.name) score += 10
    if (site.status === 'PUBLISHED') score += 20
    if (site._count?.pages > 0) score += 20
    return score
  }

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🔍 SEO管理</h1>
        <p className="text-gray-500 text-sm">サイトのSEO設定を確認・改善</p>
      </div>

      <div className="space-y-4">
        {sites.map((site) => {
          const score = getScore(site)
          return (
            <div key={site.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{site.name}</h3>
                  <p className="text-xs text-gray-500">{site.affiliateTitle}</p>
                </div>
                <div className="text-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${
                    score >= 80 ? 'bg-green-100 text-green-700' :
                    score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{score}</div>
                  <p className="text-xs text-gray-400 mt-1">スコア</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'メタタイトル', value: site.metaTitle, maxLen: 60 },
                  { label: 'メタディスクリプション', value: site.metaDescription, maxLen: 160 },
                  { label: 'キーワード', value: site.metaKeywords, maxLen: 200 },
                ].map((item) => (
                  <div key={item.label} className={`p-3 rounded-lg ${item.value ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <span>{item.value ? '✓' : '✕'}</span>
                      <p className="text-xs font-medium">{item.label}</p>
                    </div>
                    {item.value ? (
                      <p className="text-xs text-gray-600 truncate">{item.value}</p>
                    ) : (
                      <p className="text-xs text-red-500">未設定</p>
                    )}
                  </div>
                ))}
                <div className={`p-3 rounded-lg ${site.status === 'PUBLISHED' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className="text-xs font-medium">公開ステータス</p>
                  <p className="text-xs mt-1">{site.status === 'PUBLISHED' ? '✓ 公開中' : '下書き'}</p>
                </div>
              </div>
            </div>
          )
        })}
        {!sites.length && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-3">🔍</p>
            <p>サイトがありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
