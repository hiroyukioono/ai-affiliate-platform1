import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('siteId')
  const days = parseInt(searchParams.get('days') || '30')
  const device = searchParams.get('device') || 'ALL'

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const where: any = {
    date: { gte: startDate },
  }

  if (siteId) {
    // Verify ownership
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: (session.user as any).id },
    })
    if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    where.siteId = siteId
  } else {
    const sites = await prisma.site.findMany({
      where: { userId: (session.user as any).id },
      select: { id: true },
    })
    where.siteId = { in: sites.map((s) => s.id) }
  }

  if (device !== 'ALL') where.device = device

  const analytics = await prisma.analytics.findMany({
    where,
    orderBy: { date: 'asc' },
  })

  // Aggregate totals
  const totals = analytics.reduce(
    (acc, row) => ({
      pageViews: acc.pageViews + row.pageViews,
      visits: acc.visits + row.visits,
      clicks: acc.clicks + row.clicks,
      conversions: acc.conversions + row.conversions,
      revenue: acc.revenue + row.revenue,
    }),
    { pageViews: 0, visits: 0, clicks: 0, conversions: 0, revenue: 0 }
  )

  const ctr = totals.pageViews > 0 ? (totals.clicks / totals.pageViews) * 100 : 0
  const cvr = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0

  // Device breakdown
  const deviceBreakdown = await prisma.analytics.groupBy({
    by: ['device'],
    where,
    _sum: { pageViews: true, clicks: true, conversions: true, revenue: true },
  })

  return NextResponse.json({
    analytics,
    totals: { ...totals, ctr: ctr.toFixed(2), cvr: cvr.toFixed(2) },
    deviceBreakdown,
  })
}
