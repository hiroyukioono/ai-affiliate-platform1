import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('siteId')

  const userId = (session.user as any).id
  const sites = await prisma.site.findMany({
    where: { userId, ...(siteId ? { id: siteId } : {}) },
    select: { id: true },
  })

  const links = await prisma.affiliateLink.findMany({
    where: { siteId: { in: sites.map((s) => s.id) } },
    include: { program: true, site: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ links })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { siteId, programId, name, originalUrl, trackingUrl } = body

  const link = await prisma.affiliateLink.create({
    data: {
      siteId,
      programId: programId || undefined,
      name,
      originalUrl,
      trackingUrl: trackingUrl || originalUrl,
      status: 'ACTIVE',
    },
  })

  return NextResponse.json({ link }, { status: 201 })
}
