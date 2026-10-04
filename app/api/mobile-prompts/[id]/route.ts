import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prompt = await prisma.mobileDesignPrompt.findUnique({
    where: { id: params.id },
    include: {
      versions: { orderBy: { version: 'desc' } },
      sites: { select: { id: true, name: true } },
    },
  })

  if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ prompt })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, prompt: promptContent, targetDevice, priority, status } = body

  const existing = await prisma.mobileDesignPrompt.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.mobileDesignPrompt.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(promptContent && { prompt: promptContent }),
      ...(targetDevice && { targetDevice }),
      ...(priority !== undefined && { priority }),
      ...(status && { status }),
    },
  })

  // Save new version
  const lastVersion = await prisma.mobilePromptVersion.findFirst({
    where: { promptId: params.id },
    orderBy: { version: 'desc' },
  })

  await prisma.mobilePromptVersion.create({
    data: {
      promptId: params.id,
      version: (lastVersion?.version || 0) + 1,
      name: updated.name,
      prompt_content: updated.prompt,
    },
  })

  return NextResponse.json({ prompt: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.mobileDesignPrompt.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
