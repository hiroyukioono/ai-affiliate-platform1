'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Site {
  id: string
  name: string
  slug: string
  affiliateTitle: string
  status: string
  createdAt: string
  publishedAt: string | null
  theme: { name: string; primaryColor: string } | null
  mobilePrompt: { name: string } | null
  _count: { pages: number; affiliateLinks: number }
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sites')
      .then((r) => r.json())
      .then((d) => { setSites(d.sites || []); setLoading(false) })
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" を削除しますか？`)) return
    await fetch(`/api/sites/${id}`, { method: 'DELETE' })
    setSites((prev) => prev.filter((s) => s.id !== id))
  }

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">サイト管理</h1>
          <p className="text-gray-500 text-sm">{sites.length}件のサイト</p>
        </div>
        <Link
          href="/admin/sites/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          ＋ 新しいサイト
        </Link>
      </div>

      <div className="grid gap-4">
        {sites.map((site) => (
          <div key={site.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    site.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {site.status === 'PUBLISHED' ? '公開中' : '下書き'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{site.affiliateTitle}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>🎨 {site.theme?.name || 'デザイン未選択'}</span>
                  <span>📱 {site.mobilePrompt?.name || 'モバイル未設定'}</span>
                  <span>📄 {site._count.pages}ページ</span>
                  <span>🔗 {site._count.affiliateLinks}リンク</span>
                  <span>作成: {new Date(site.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/builder/${site.id}`}
                  className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  ビルダー
                </Link>
                <Link
                  href={`/admin/sites/${site.id}`}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  編集
                </Link>
                <Link
                  href={`/admin/analytics?siteId=${site.id}`}
                  className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  分析
                </Link>
                <button
                  onClick={() => handleDelete(site.id, site.name)}
                  className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
        {!sites.length && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">🌐</p>
            <p className="text-gray-500 mb-4">まだサイトがありません</p>
            <Link
              href="/admin/sites/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
            >
              最初のサイトを作成
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
