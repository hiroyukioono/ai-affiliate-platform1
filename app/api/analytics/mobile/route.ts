import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const siteId = searchParams.get('siteId')
  const days = parseInt(searchParams.get('days') || '30')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const userId = (session.user as any).id
  const sites = siteId
    ? [{ id: siteId }]
    : await prisma.site.findMany({ where: { userId }, select: { id: true } })

  const siteIds = sites.map((s) => s.id)

  const mobileData = await prisma.analytics.aggregate({
    where: { siteId: { in: siteIds }, device: 'MOBILE', date: { gte: startDate } },
    _sum: { pageViews: true, visits: true, clicks: true, conversions: true, revenue: true },
  })

  const desktopData = await prisma.analytics.aggregate({
    where: { siteId: { in: siteIds }, device: 'DESKTOP', date: { gte: startDate } },
    _sum: { pageViews: true, visits: true, clicks: true, conversions: true, revenue: true },
  })

  const mobilePv = mobileData._sum.pageViews || 0
  const mobileClicks = mobileData._sum.clicks || 0
  const mobileCvs = mobileData._sum.conversions || 0
  const mobileRevenue = mobileData._sum.revenue || 0
  const mobileCtr = mobilePv > 0 ? ((mobileClicks / mobilePv) * 100).toFixed(2) : '0'
  const mobileCvr = mobileClicks > 0 ? ((mobileCvs / mobileClicks) * 100).toFixed(2) : '0'

  const desktopPv = desktopData._sum.pageViews || 0
  const desktopClicks = desktopData._sum.clicks || 0
  const desktopCtr = desktopPv > 0 ? ((desktopClicks / desktopPv) * 100).toFixed(2) : '0'

  // Simulate mobile issues based on data
  const issues = []
  if (parseFloat(mobileCtr) < parseFloat(desktopCtr) * 0.5) {
    issues.push({
      severity: 'ERROR',
      component: 'CTA',
      message: 'スマートフォンのCTRがデスクトップの50%以下です。CTA最適化を推奨します。',
    })
  }
  if (parseFloat(mobileCvr) < 0.5) {
    issues.push({
      severity: 'WARNING',
      component: '比較表',
      message: 'モバイルCVRが0.5%以下です。比較表・CTAの表示確認を推奨します。',
    })
  }

  const dailyMobile = await prisma.analytics.findMany({
    where: { siteId: { in: siteIds }, device: 'MOBILE', date: { gte: startDate } },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json({
    mobile: {
      pageViews: mobilePv,
      visits: mobileData._sum.visits || 0,
      clicks: mobileClicks,
      conversions: mobileCvs,
      revenue: mobileRevenue,
      ctr: mobileCtr,
      cvr: mobileCvr,
    },
    desktop: {
      pageViews: desktopPv,
      clicks: desktopClicks,
      ctr: desktopCtr,
    },
    issues,
    daily: dailyMobile,
  })
}
