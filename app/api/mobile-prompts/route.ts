import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'

const Schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  prompt: z.string().min(1),
  targetDevice: z.enum(['MOBILE', 'TABLET', 'ALL']).default('MOBILE'),
  priority: z.number().int().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prompts = await prisma.mobileDesignPrompt.findMany({
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    include: {
      _count: { select: { sites: true } },
      versions: { orderBy: { version: 'desc' }, take: 1 },
    },
  })

  return NextResponse.json({ prompts })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = Schema.parse(body)

    const prompt = await prisma.mobileDesignPrompt.create({
      data: {
        name: data.name!,
        description: data.description,
        prompt: data.prompt!,
        targetDevice: data.targetDevice!,
        priority: data.priority!,
        status: data.status!,
      },
    })

    // Save initial version
    await prisma.mobilePromptVersion.create({
      data: {
        promptId: prompt.id,
        version: 1,
        name: prompt.name,
        prompt_content: prompt.prompt,
      },
    })

    return NextResponse.json({ prompt }, { status: 201 })
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: e.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
