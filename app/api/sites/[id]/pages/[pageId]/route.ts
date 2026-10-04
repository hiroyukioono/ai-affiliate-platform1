import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { prisma } from '../../../../../../lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; pageId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const page = await prisma.page.findFirst({
    where: { id: params.pageId, siteId: params.id },
  })

  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ page })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; pageId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, content, status, metaTitle, metaDesc, sortOrder } = body

  const page = await prisma.page.update({
    where: { id: params.pageId },
    data: {
      ...(title && { title }),
      ...(content !== undefined && { content }),
      ...(status && { status }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDesc !== undefined && { metaDesc }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  })

  // Save version snapshot
  await prisma.siteVersion.create({
    data: {
      siteId: params.id,
      version: Date.now(),
      content: JSON.stringify({ pageId: params.pageId, content }),
      comment: `Page "${page.title}" updated`,
    },
  })

  return NextResponse.json({ page })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; pageId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.page.delete({ where: { id: params.pageId } })
  return NextResponse.json({ success: true })
}
