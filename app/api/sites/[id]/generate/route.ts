import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { generateSiteContent } from '../../../../../lib/openai'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await prisma.site.findFirst({
    where: { id: params.id, userId: (session.user as any).id },
  })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const generated = await generateSiteContent(site.affiliateTitle, site.description || undefined)

    await prisma.site.update({
      where: { id: params.id },
      data: {
        metaTitle: generated.metaTitle,
        metaDescription: generated.metaDescription,
        metaKeywords: generated.metaKeywords,
      },
    })

    // Create pages from AI generation
    for (let i = 0; i < generated.pages.length; i++) {
      const p = generated.pages[i]
      const defaultComponents = [
        {
          id: `hero-${Date.now()}-${i}`,
          type: 'hero',
          content: { title: p.title, subtitle: '' },
          desktopConfig: { display: 'block' },
          tabletConfig: { display: 'block' },
          mobileConfig: { display: 'block' },
        },
        {
          id: `text-${Date.now()}-${i}`,
          type: 'text',
          content: { body: p.content },
          desktopConfig: { display: 'block' },
          tabletConfig: { display: 'block' },
          mobileConfig: { display: 'block', fontSize: '16px' },
        },
        {
          id: `cta-${Date.now()}-${i}`,
          type: 'cta',
          content: { text: '詳細を見る・申し込む', url: site.affiliateUrl || '#', color: '#3B82F6' },
          desktopConfig: { width: '300px' },
          tabletConfig: { width: '80%' },
          mobileConfig: { width: '100%' },
        },
      ]

      await prisma.page.create({
        data: {
          siteId: site.id,
          title: p.title,
          slug: p.slug,
          pageType: p.pageType || 'ARTICLE',
          status: 'DRAFT',
          content: JSON.stringify(defaultComponents),
          sortOrder: i,
        },
      })
    }

    // Save version
    await prisma.siteVersion.create({
      data: {
        siteId: site.id,
        version: 1,
        content: JSON.stringify(generated),
        comment: 'AI生成',
      },
    })

    return NextResponse.json({ success: true, generated, suggestions: generated.suggestions })
  } catch (e: any) {
    console.error('Generation error:', e)
    return NextResponse.json({ error: e.message || 'Generation failed' }, { status: 500 })
  }
}
