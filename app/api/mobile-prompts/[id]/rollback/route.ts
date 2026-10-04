import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { versionId } = await req.json()

  const version = await prisma.mobilePromptVersion.findUnique({ where: { id: versionId } })
  if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 })

  const lastVersion = await prisma.mobilePromptVersion.findFirst({
    where: { promptId: params.id },
    orderBy: { version: 'desc' },
  })

  const updated = await prisma.mobileDesignPrompt.update({
    where: { id: params.id },
    data: { name: version.name, prompt: version.prompt_content },
  })

  await prisma.mobilePromptVersion.create({
    data: {
      promptId: params.id,
      version: (lastVersion?.version || 0) + 1,
      name: version.name,
      prompt_content: version.prompt_content,
    },
  })

  return NextResponse.json({ prompt: updated })
}
