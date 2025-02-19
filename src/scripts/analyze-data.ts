import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

const ratesPath = path.join(process.cwd(), 'data/raw/rates')
const attributesPath = path.join(process.cwd(), 'data/raw/attributes')

async function analyzeFiles() {
  const rateFiles = fs.readdirSync(ratesPath)
  const attributeFiles = fs.readdirSync(attributesPath)
  
  console.log('\nAnalyzing Rates:')
  await analyzeFileContents(path.join(ratesPath, rateFiles[0]))
  
  console.log('\nAnalyzing Attributes:')
  await analyzeFileContents(path.join(attributesPath, attributeFiles[0]))
}

async function analyzeFileContents(filePath: string) {
  const emptyFields: Record<string, number> = {}
  let totalRows = 0
  let sampleRow: any = null

  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        totalRows++
        
        // Get first row as sample
        if (!sampleRow) sampleRow = data
        
        // Track empty fields
        Object.entries(data).forEach(([key, value]) => {
          if (!value || value === '') {
            emptyFields[key] = (emptyFields[key] || 0) + 1
          }
        })
      })
      .on('end', () => {
        console.log('\nSample Row:')
        console.log(JSON.stringify(sampleRow, null, 2))
        
        console.log('\nFields with empty values:')
        Object.entries(emptyFields)
          .sort(([, a], [, b]) => b - a) // Sort by most empty first
          .forEach(([field, count]) => {
            const percentage = ((count / totalRows) * 100).toFixed(2)
            console.log(`${field}: ${percentage}% empty (${count}/${totalRows} rows)`)
          })
        
        console.log(`\nTotal rows: ${totalRows}`)
        resolve(true)
      })
  })
}

analyzeFiles() 