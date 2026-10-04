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

  const experiments = await prisma.experiment.findMany({
    where: { siteId: { in: sites.map((s) => s.id) } },
    include: { site: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ experiments })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { siteId, name, description, variantA, variantB, trafficSplit } = body

  const experiment = await prisma.experiment.create({
    data: {
      siteId,
      name,
      description,
      variantA: JSON.stringify(variantA || {}),
      variantB: JSON.stringify(variantB || {}),
      trafficSplit: trafficSplit || 0.5,
      status: 'DRAFT',
    },
  })

  return NextResponse.json({ experiment }, { status: 201 })
}
