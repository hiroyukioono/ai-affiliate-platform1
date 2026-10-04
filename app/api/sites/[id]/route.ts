import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await prisma.site.findFirst({
    where: { id: params.id, userId: (session.user as any).id },
    include: {
      theme: true,
      mobilePrompt: true,
      pages: { orderBy: { sortOrder: 'asc' } },
      affiliateLinks: { include: { program: true } },
      mobileSettings: true,
      versions: { orderBy: { version: 'desc' }, take: 10 },
    },
  })

  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ site })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await prisma.site.findFirst({
    where: { id: params.id, userId: (session.user as any).id },
  })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name, description, affiliateTitle, affiliateUrl, themeId, mobilePromptId,
          metaTitle, metaDescription, metaKeywords, status } = body

  const updatedSite = await prisma.site.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(affiliateTitle && { affiliateTitle }),
      ...(affiliateUrl !== undefined && { affiliateUrl }),
      ...(themeId !== undefined && { themeId }),
      ...(mobilePromptId !== undefined && { mobilePromptId }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(metaKeywords !== undefined && { metaKeywords }),
      ...(status && { status, publishedAt: status === 'PUBLISHED' ? new Date() : undefined }),
    },
  })

  return NextResponse.json({ site: updatedSite })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const site = await prisma.site.findFirst({
    where: { id: params.id, userId: (session.user as any).id },
  })
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.site.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
