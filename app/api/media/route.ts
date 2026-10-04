import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const files = await prisma.mediaFile.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ files })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, url, type, size, alt } = body

  // Input validation
  if (!name || !url || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate URL format
  try {
    new URL(url.startsWith('/') ? `http://localhost${url}` : url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const file = await prisma.mediaFile.create({
    data: { name, url, type, size: size || 0, alt },
  })

  return NextResponse.json({ file }, { status: 201 })
}
