'use client'
import { useState, useEffect } from 'react'
import { Container, Typography, Box, CircularProgress, Checkbox, FormControlLabel } from '@mui/material'
import { BarChart } from '@mui/x-charts'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

export default function Home() {
  const [data, setData] = useState<{state: string, avgRate: number}[]>([])
  const [tobaccoData, setTobaccoData] = useState<{state: string, avgRate: number}[]>([])
  const [loading, setLoading] = useState(true)
  const [tobacco, setTobacco] = useState(false)

  useEffect(() => {
    const url = `/api/rates?tobacco=true`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        data.sort((a: {state: string, avgRate: number}, b: {state: string, avgRate: number}) => a.state.localeCompare(b.state))
        setTobaccoData(data)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const url = `/api/rates?tobacco=false`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        data.sort((a: {state: string, avgRate: number}, b: {state: string, avgRate: number}) => a.state.localeCompare(b.state))
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Average Impact of Tobacco Use on Healthcare Costs
        </Typography>
        
        <Box mt={4} mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={tobacco}
                onChange={(e) => setTobacco(e.target.checked)}
                sx={{
                  color: 'white',
                  '&.Mui-checked': {
                    color: 'white',
                  },
                }}
              />
            }
            label="Show Tobacco User Rates"
            sx={{ color: 'white' }}
          />
        </Box>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Average Individual Rates by State
          </Typography>
          <BarChart
            sx={{ "& .MuiChartsLegend-series text": { fill: "white !important" }, }}
            xAxis={[{ 
              scaleType: 'band', 
              data: data.map(d => d.state),
              label: 'States'
            }]}
            height={400}
            series={[{ 
              data: data.map(d => d.avgRate), 
              label: 'Non-Tobacco User Rates',
              valueFormatter: (value: number | null) => value ? currencyFormatter.format(value) : '$0.00'
            }, tobacco ?{
              data: tobaccoData.map(d => d.avgRate),
              label: 'Tobacco User Rates',
              valueFormatter: (value: number | null) => value ? currencyFormatter.format(value) : '$0.00'
            }: undefined].filter(v => v !== undefined)}
            slotProps={{
              axisTick: {
                style: {
                  stroke: '#fff'
                }
              },
              axisTickLabel: {
                stroke: '#fff'
              },
              axisContent: {
                sx: {
                  color: '#fff',
                  fill: '#fff',
                  stroke: '#fff'
                }
              },
              barLabel: {
                style: {
                  stroke: '#fff',
                  fill: '#fff'
                }
              },
              axisLabel: {
                stroke: '#fff',
                fill: '#fff'
              },
              axisLine: {
                stroke: '#fff',
                fill: '#fff'
              },
              legend: {
                series: {
                  stroke: '#fff'
                }
              }
            }}
          />
        </Box>
      </Box>
    </Container>
  )
}