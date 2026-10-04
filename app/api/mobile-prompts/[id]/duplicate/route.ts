import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const original = await prisma.mobileDesignPrompt.findUnique({ where: { id: params.id } })
  if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const duplicate = await prisma.mobileDesignPrompt.create({
    data: {
      name: `${original.name} (コピー)`,
      description: original.description,
      prompt: original.prompt,
      targetDevice: original.targetDevice,
      priority: original.priority,
      status: 'INACTIVE',
    },
  })

  await prisma.mobilePromptVersion.create({
    data: {
      promptId: duplicate.id,
      version: 1,
      name: duplicate.name,
      prompt_content: duplicate.prompt,
    },
  })

  return NextResponse.json({ prompt: duplicate }, { status: 201 })
}
