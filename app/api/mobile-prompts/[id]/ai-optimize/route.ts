import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { optimizeMobilePrompt } from '../../../../../lib/openai'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prompt = await prisma.mobileDesignPrompt.findUnique({ where: { id: params.id } })
  if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const optimized = await optimizeMobilePrompt(prompt.prompt)
    return NextResponse.json({ optimizedPrompt: optimized })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Optimization failed' }, { status: 500 })
  }
}
