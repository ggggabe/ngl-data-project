import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const stateAverages = await prisma.rate.groupBy({
    by: ['state'],
    _avg: {
      individualRate: true
    }
  })

  const data = stateAverages.map(item => ({
    state: item.state,
    avgRate: item._avg.individualRate || 0
  }))

  return NextResponse.json(data)
} 