import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pages = await prisma.page.findMany({
    where: { siteId: params.id },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json({ pages })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, slug, content, pageType, metaTitle, metaDesc } = body

  const page = await prisma.page.create({
    data: {
      siteId: params.id,
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      content: content || JSON.stringify([]),
      pageType: pageType || 'ARTICLE',
      metaTitle,
      metaDesc,
      status: 'DRAFT',
    },
  })

  return NextResponse.json({ page }, { status: 201 })
}
