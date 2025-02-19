import { prisma } from '@/lib/prisma'

export default async function Home() {
  // Create a test record
  const created = await prisma.test.create({
    data: {
      name: "Test Entry " + new Date().toISOString()
    }
  })

  // Fetch all records
  const allTests = await prisma.test.findMany()
  
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Data Project</h1>
      <div className="mt-4">
        <h2>Just Created:</h2>
        <pre>{JSON.stringify(created, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <h2>All Records:</h2>
        <pre>{JSON.stringify(allTests, null, 2)}</pre>
      </div>
    </main>
  )
}
