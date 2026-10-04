import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { generateMobileOptimization } from '../../../lib/openai'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { siteId, mobilePromptId } = await req.json()

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: (session.user as any).id },
    include: {
      pages: true,
      theme: true,
      mobileSettings: true,
    },
  })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const prompt = mobilePromptId
    ? await prisma.mobileDesignPrompt.findUnique({ where: { id: mobilePromptId } })
    : await prisma.mobileDesignPrompt.findFirst({ where: { status: 'ACTIVE' } })

  if (!prompt) return NextResponse.json({ error: 'No mobile prompt found' }, { status: 404 })

  try {
    const siteData = {
      name: site.name,
      pageCount: site.pages.length,
      theme: site.theme?.name,
      primaryColor: site.theme?.primaryColor,
      mobileSettings: site.mobileSettings,
      components: site.pages.flatMap((p) => {
        try {
          return JSON.parse(p.content)
        } catch {
          return []
        }
      }),
    }

    const result = await generateMobileOptimization(siteData, prompt.prompt)

    // Save recommendations
    for (const rec of result.recommendations || []) {
      await prisma.aiRecommendation.create({
        data: {
          siteId,
          type: 'MOBILE',
          title: `${rec.component}: ${rec.issue}`,
          description: rec.suggestion,
          reasoning: `優先度: ${rec.priority}`,
          dataUsed: JSON.stringify({ component: rec.component }),
          uncertainty: rec.uncertainty,
          status: 'PENDING',
          priority: rec.priority === 'HIGH' ? 1 : rec.priority === 'MEDIUM' ? 2 : 3,
        },
      })
    }

    return NextResponse.json({
      result,
      promptUsed: prompt.name,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Check failed' }, { status: 500 })
  }
}
