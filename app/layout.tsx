import type { Metadata } from 'next'
// @ts-expect-error Next.js processes global CSS imports at build time.
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'AI Affiliate Platform',
  description: 'AI搭載アフィリエイトWebサイト生成・運用・分析・改善プラットフォーム',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
