import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { status, startDate, endDate, results, winner, name, description, variantA, variantB } = body

  const experiment = await prisma.experiment.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(results && { results: JSON.stringify(results) }),
      ...(winner !== undefined && { winner }),
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(variantA && { variantA: JSON.stringify(variantA) }),
      ...(variantB && { variantB: JSON.stringify(variantB) }),
    },
  })

  return NextResponse.json({ experiment })
}
