'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { label: 'ダッシュボード', href: '/admin', icon: '🏠' },
  { label: 'サイト一覧', href: '/admin/sites', icon: '🌐' },
  { label: 'サイトビルダー', href: '/admin/builder', icon: '🔧' },
  { label: 'デザイン', href: '/admin/designs', icon: '🎨' },
  { label: 'レスポンシブデザイン', href: '/admin/responsive-designs', icon: '📱' },
  { label: 'モバイル最適化', href: '/admin/mobile', icon: '📲' },
  { label: 'モバイルプロンプト', href: '/admin/mobile-prompts', icon: '✨' },
  { label: 'メディア', href: '/admin/media', icon: '🖼️' },
  { label: '記事', href: '/admin/articles', icon: '📝' },
  { label: 'アフィリエイト', href: '/admin/affiliate-links', icon: '🔗' },
  { label: 'アクセス分析', href: '/admin/analytics', icon: '📊' },
  { label: '成果・収益', href: '/admin/revenue', icon: '💰' },
  { label: 'AI提案', href: '/admin/recommendations', icon: '🤖' },
  { label: 'A/Bテスト', href: '/admin/experiments', icon: '⚗️' },
  { label: 'SEO', href: '/admin/seo', icon: '🔍' },
  { label: '設定', href: '/admin/settings', icon: '⚙️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">AI</div>
          <div>
            <p className="text-sm font-semibold leading-tight">AI Affiliate</p>
            <p className="text-xs text-gray-400">Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
        >
          🚪 ログアウト
        </button>
      </div>
    </aside>
  )
}
