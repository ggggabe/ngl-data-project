import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { prisma } from '@/lib/prisma'

async function processAttributes() {
  const attributesPath = path.join(process.cwd(), 'data/raw/attributes')
  const files = fs.readdirSync(attributesPath)
  
  console.log('Processing attributes...')
  const batchSize = 1000
  let batch: any[] = []
  let processedCount = 0
  let currentLine = 0
  let failedLines: number[] = []
  const promises: Promise<any>[] = []

  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(attributesPath, files[0]))
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim()
      }))
      .on('data', (data) => {
        currentLine++
        
        try {
          batch.push({
            lineNumber: currentLine,
            year: parseInt(data.BusinessYear),
            state: data.StateCode,
            planId: data.PlanId,
            issuerId: data.IssuerId,
            issuerName: data.IssuerMarketPlaceMarketingName,
            standardComponentId: data.StandardComponentId,
            planMarketingName: data.PlanMarketingName,
            hiosProductId: data.HIOSProductId,
            
            marketCoverage: data.MarketCoverage,
            dentalOnlyPlan: data.DentalOnlyPlan,
            isNewPlan: data.IsNewPlan,
            planType: data.PlanType,
            metalLevel: data.MetalLevel,
            
            networkId: data.NetworkId,
            serviceAreaId: data.ServiceAreaId,
            nationalNetwork: data.NationalNetwork,
            outOfCountryCoverage: data.OutOfCountryCoverage,
            outOfServiceAreaCoverage: data.OutOfServiceAreaCoverage,
            
            planEffectiveDate: data.PlanEffectiveDate ? new Date(data.PlanEffectiveDate) : null,
            planExpirationDate: data.PlanExpirationDate ? new Date(data.PlanExpirationDate) : null,
            
            mehbCombInnOonIndividualMOOP: data.MEHBCombInnOonIndividualMOOP || null,
            mehbCombInnOonFamilyPerPersonMOOP: data.MEHBCombInnOonFamilyPerPersonMOOP || null,
            mehbCombInnOonFamilyPerGroupMOOP: data.MEHBCombInnOonFamilyPerGroupMOOP || null,
            mehbDedCombInnOonIndividual: data.MEHBDedCombInnOonIndividual || null,
            mehbDedCombInnOonFamilyPerPerson: data.MEHBDedCombInnOonFamilyPerPerson || null,
            mehbDedCombInnOonFamilyPerGroup: data.MEHBDedCombInnOonFamilyPerGroup || null,
            
            childOnlyOffering: data.ChildOnlyOffering,
            compositeRatingOffered: data.CompositeRatingOffered
          })

          if (batch.length >= batchSize) {
            try {
              promises.push(prisma.attributePuf.createMany({
                data: batch,
              }))
              processedCount += batch.length
              console.log(`Processed ${processedCount} records (at line ${currentLine})`)
            } catch (e) {
              console.error(`Error processing batch at line ${currentLine}:`, e)
              const batchStartLine = currentLine - batch.length + 1
              for (let i = 0; i < batch.length; i++) {
                failedLines.push(batchStartLine + i)
              }
            }
            batch = []
          }
        } catch (e) {
          console.error(`Error processing line ${currentLine}:`, e)
          failedLines.push(currentLine)
        }
      })
      .on('end', async () => {
        // Process remaining records
        if (batch.length > 0) {
          try {
            await prisma.attributePuf.createMany({
              data: batch,
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

  const count = await prisma.attributePuf.count()
  console.log(`\nTotal attributes in MongoDB: ${count}`)
}

processAttributes()
  .then(() => process.exit(0))
  .catch(console.error) 