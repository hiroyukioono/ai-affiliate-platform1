import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'

const ThemeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  primaryColor: z.string().default('#3B82F6'),
  secondaryColor: z.string().default('#1E40AF'),
  fontFamily: z.string().default("'Noto Sans JP', sans-serif"),
  cssVariables: z.string().default('{}'),
  layoutConfig: z.string().default('{}'),
})

export async function GET() {
  const themes = await prisma.designTheme.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    include: { _count: { select: { sites: true } } },
  })
  return NextResponse.json({ themes })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = ThemeSchema.parse(body)
    const theme = await prisma.designTheme.create({ data: { ...data, name: data.name! } })
    return NextResponse.json({ theme }, { status: 201 })
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: e.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
