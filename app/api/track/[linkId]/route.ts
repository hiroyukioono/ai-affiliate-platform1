import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { linkId: string } }) {
  const link = await prisma.affiliateLink.findUnique({ where: { id: params.linkId } })
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const ua = req.headers.get('user-agent') || ''
  const device = /mobile|android|iphone/i.test(ua)
    ? 'MOBILE'
    : /tablet|ipad/i.test(ua)
    ? 'TABLET'
    : 'DESKTOP'

  // Increment clicks
  await prisma.affiliateLink.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } },
  })

  // Record click event
  await prisma.clickEvent.create({
    data: {
      linkId: link.id,
      siteId: link.siteId,
      device,
      userAgent: ua.substring(0, 200),
      referrer: req.headers.get('referer')?.substring(0, 500),
    },
  })

  // Update analytics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.analytics.upsert({
    where: { id: `${link.siteId}-${device}-${today.toISOString()}` } as any,
    update: { clicks: { increment: 1 } },
    create: {
      siteId: link.siteId,
      date: today,
      device,
      pageViews: 0,
      visits: 0,
      clicks: 1,
      conversions: 0,
      revenue: 0,
    },
  })

  return NextResponse.redirect(link.trackingUrl)
}
