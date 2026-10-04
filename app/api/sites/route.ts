import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'

const CreateSiteSchema = z.object({
  name: z.string().min(1).max(100),
  affiliateTitle: z.string().min(1).max(200),
  description: z.string().optional(),
  affiliateUrl: z.string().url().optional().or(z.literal('')),
  themeId: z.string().optional(),
  mobilePromptId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sites = await prisma.site.findMany({
    where: { userId: (session.user as any).id },
    include: {
      theme: { select: { name: true, primaryColor: true } },
      mobilePrompt: { select: { name: true } },
      _count: { select: { pages: true, affiliateLinks: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ sites })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = CreateSiteSchema.parse(body)

    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\u3000-\u9fff\u30a0-\u30ff\u3040-\u309f]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now()

    const site = await prisma.site.create({
      data: {
        userId: (session.user as any).id,
        name: data.name,
        slug,
        affiliateTitle: data.affiliateTitle,
        description: data.description,
        affiliateUrl: data.affiliateUrl || undefined,
        themeId: data.themeId || undefined,
        mobilePromptId: data.mobilePromptId || undefined,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({ site }, { status: 201 })
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: e.errors }, { status: 400 })
    }
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
