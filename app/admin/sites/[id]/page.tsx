'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Site {
  id: string
  name: string
  slug: string
  affiliateTitle: string
  description: string
  affiliateUrl: string
  status: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  themeId?: string | null
  mobilePromptId?: string | null
  theme: { id: string; name: string } | null
  mobilePrompt: { id: string; name: string } | null
  pages: Array<{ id: string; title: string; slug: string; status: string; pageType: string }>
}

interface Theme { id: string; name: string }
interface MobilePrompt { id: string; name: string }

export default function SiteEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [site, setSite] = useState<Site | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])
  const [mobilePrompts, setMobilePrompts] = useState<MobilePrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [form, setForm] = useState<Partial<Site>>({})

  useEffect(() => {
    Promise.all([
      fetch(`/api/sites/${id}`).then((r) => r.json()),
      fetch('/api/designs').then((r) => r.json()),
      fetch('/api/mobile-prompts').then((r) => r.json()),
    ]).then(([s, t, m]) => {
      setSite(s.site)
      setForm(s.site)
      setThemes(t.themes || [])
      setMobilePrompts(m.prompts || [])
      setLoading(false)
    })
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/sites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    alert('保存しました')
  }

  const handlePublish = async () => {
    setPublishing(true)
    await fetch(`/api/sites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: site?.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }),
    })
    setSite((prev) => prev ? { ...prev, status: prev.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' } : prev)
    setPublishing(false)
  }

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>
  if (!site) return <div className="p-6 text-red-500">サイトが見つかりません</div>

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
          <p className="text-gray-500 text-sm">サイト設定・編集</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/builder/${id}`}
            className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            🔧 ビルダー
          </Link>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              site.status === 'PUBLISHED'
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {publishing ? '処理中...' : site.status === 'PUBLISHED' ? '非公開にする' : '公開する'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">サイト名</label>
              <input
                type="text"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">アフィリエイトタイトル</label>
              <input
                type="text"
                value={form.affiliateTitle || ''}
                onChange={(e) => setForm({ ...form, affiliateTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">アフィリエイトURL</label>
              <input
                type="url"
                value={form.affiliateUrl || ''}
                onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">SEO設定</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メタタイトル（60文字以内）</label>
              <input
                type="text"
                value={form.metaTitle || ''}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">{(form.metaTitle || '').length}/60文字</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メタディスクリプション（160文字以内）</label>
              <textarea
                value={form.metaDescription || ''}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                maxLength={160}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{(form.metaDescription || '').length}/160文字</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">キーワード（カンマ区切り）</label>
              <input
                type="text"
                value={form.metaKeywords || ''}
                onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
                placeholder="キーワード1,キーワード2,キーワード3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Design & Mobile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">デザイン・モバイル設定</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">デザインテーマ</label>
              <select
                value={form.themeId || ''}
                onChange={(e) => setForm({ ...form, themeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="">選択してください</option>
                {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">モバイルプロンプト</label>
              <select
                value={form.mobilePromptId || ''}
                onChange={(e) => setForm({ ...form, mobilePromptId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                <option value="">選択してください</option>
                {mobilePrompts.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Pages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">ページ一覧</h2>
            <Link
              href={`/admin/builder/${id}`}
              className="text-blue-600 text-sm hover:underline"
            >
              ビルダーで編集
            </Link>
          </div>
          <div className="space-y-2">
            {site.pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900">{page.title}</span>
                  <span className="text-xs text-gray-400 ml-2">/{page.slug}</span>
                  <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${
                    page.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>{page.status === 'PUBLISHED' ? '公開' : '下書き'}</span>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{page.pageType}</span>
              </div>
            ))}
            {!site.pages.length && (
              <p className="text-gray-400 text-sm text-center py-4">ページがありません。ビルダーでページを追加してください。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
