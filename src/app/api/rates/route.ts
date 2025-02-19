import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tobacco = searchParams.get('tobacco')
  
  const stateAverages = await prisma.rate.groupBy({
    by: ['state'],
    _avg: {
      individualRate: true
    },
    where: {
      tobacco: tobacco === 'true'? {not: {equals: 'No Preference' }} : { equals: 'No Preference' } 
    }
  })

  const data = stateAverages.map(item => ({
    state: item.state,
    avgRate: item._avg.individualRate || 0
  }))

  return NextResponse.json(data)
} 
