'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Prompt {
  id: string
  name: string
  description: string
  targetDevice: string
  priority: number
  status: string
  createdAt: string
  _count: { sites: number }
  versions: Array<{ id: string; version: number }>
}

export default function MobilePromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mobile-prompts')
      .then((r) => r.json())
      .then((d) => { setPrompts(d.prompts || []); setLoading(false) })
  }, [])

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/mobile-prompts/${id}/duplicate`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) setPrompts((prev) => [...prev, data.prompt])
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" を削除しますか？`)) return
    await fetch(`/api/mobile-prompts/${id}`, { method: 'DELETE' })
    setPrompts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await fetch(`/api/mobile-prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setPrompts((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p))
  }

  if (loading) return <div className="p-6 text-gray-500">読み込み中...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">スマートフォン最適化プロンプト管理</h1>
          <p className="text-gray-500 text-sm">{prompts.length}件のプロンプト</p>
        </div>
        <Link
          href="/admin/mobile-prompts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          ＋ 新しいプロンプト
        </Link>
      </div>

      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg">📱</span>
                  <h3 className="text-lg font-semibold text-gray-900">{prompt.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    prompt.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {prompt.status === 'ACTIVE' ? 'アクティブ' : '無効'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    prompt.targetDevice === 'MOBILE' ? 'bg-blue-100 text-blue-700' :
                    prompt.targetDevice === 'TABLET' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {prompt.targetDevice}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{prompt.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>優先度: {prompt.priority}</span>
                  <span>使用サイト: {prompt._count.sites}件</span>
                  <span>バージョン: {prompt.versions[0]?.version || 1}</span>
                  <span>作成: {new Date(prompt.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/mobile-prompts/${prompt.id}`}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  編集
                </Link>
                <button
                  onClick={() => handleDuplicate(prompt.id)}
                  className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  複製
                </button>
                <button
                  onClick={() => handleToggleStatus(prompt.id, prompt.status)}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  {prompt.status === 'ACTIVE' ? '無効化' : '有効化'}
                </button>
                <button
                  onClick={() => handleDelete(prompt.id, prompt.name)}
                  className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
        {!prompts.length && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📱</p>
            <p className="text-gray-500 mb-4">プロンプトがありません</p>
            <Link
              href="/admin/mobile-prompts/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
            >
              最初のプロンプトを作成
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
