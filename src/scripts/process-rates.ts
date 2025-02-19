import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { prisma } from '@/lib/prisma'

const safeParseFloat = (value: string): number | null => {
  if (!value || value === '') return null
  const num = parseFloat(value)
  return isNaN(num) ? null : num
}

async function processRates() {
  const ratesPath = path.join(process.cwd(), 'data/raw/rates')
  const files = fs.readdirSync(ratesPath)
  
  console.log('Clearing existing rates...')
  await prisma.rate.deleteMany({})
  
  console.log('Processing rates...')
  const batchSize = 1000
  // eslint-disable-next-line
  let batch: any[] = []
  let processedCount = 0
  let currentLine = 0
  const failedLines: number[] = []
  // eslint-disable-next-line
  const promises: Promise<any>[] = [] 

  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(ratesPath, files[0]))
      .pipe(csv())
      .on('data', (data) => {
        currentLine++
        
        // Skip family option rows
        if (data.Age === 'Family Option') {
          return
        }
        
        const individualRate = safeParseFloat(data.IndividualRate)
        if (!individualRate) {
          failedLines.push(currentLine)
          return
        }
        
        batch.push({
          year: parseInt(data.BusinessYear),
          state: data.StateCode,
          planId: data.PlanId,
          area: data.RatingAreaId,
          tobacco: data.Tobacco || null,
          individualRate,
          individualTobaccoRate: safeParseFloat(data.IndividualTobaccoRate),
          lineNumber: currentLine
        })

        if (batch.length >= batchSize) {
          try {
            console.log(`Processed ${processedCount} records (at line ${currentLine})`)
            promises.push(prisma.rate.createMany({
              data: batch
            }))
            processedCount += batch.length
            console.log(`Processed ${processedCount} records (at line ${currentLine})`)
          } catch (e) {
            console.error(`Error processing batch at line ${currentLine}:`, e)
            // Mark all lines in this batch as failed
            const batchStartLine = currentLine - batch.length + 1
            for (let i = 0; i < batch.length; i++) {
              failedLines.push(batchStartLine + i)
            }
          }
          batch = []
        }
      })
      .on('end', async () => {
        // Process remaining records
        if (batch.length > 0) {
          try {
            await prisma.rate.createMany({
              data: batch
            })
            processedCount += batch.length
          } catch (e) {
            console.error(`Error processing final batch:`, e)
            const batchStartLine = currentLine - batch.length + 1
            for (let i = 0; i < batch.length; i++) {
              failedLines.push(batchStartLine + i)
            }
          }
        }
        
        // Report results
        console.log(`\nProcessing complete:`)
        console.log(`- Total processed: ${processedCount}`)
        console.log(`- Failed lines: ${failedLines.length}`)
        if (failedLines.length > 0) {
          console.log(`- Failed line numbers: ${failedLines.join(', ')}`)
        }
        await Promise.all(promises)
        resolve(true)
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error)
        reject(error)
      })
  })

  const count = await prisma.rate.count()
  console.log(`\nTotal rates in MongoDB: ${count}`)
}

processRates()
  .then(() => process.exit(0))
  .catch(console.error) 