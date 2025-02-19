'use client'
import { useState, useEffect } from 'react'
import { Container, Typography, Box, CircularProgress } from '@mui/material'
import { BarChart } from '@mui/x-charts'

export default function Home() {
  const [data, setData] = useState<{state: string, avgRate: number}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rates')
      .then(res => res.json())
      .then(data => {
        data.sort((a, b) => a.state.localeCompare(b.state))
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
          Healthcare Plan Cost Explorer
        </Typography>
        
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Average Individual Rates by State
          </Typography>
          <BarChart
            xAxis={[{ 
              scaleType: 'band', 
              data: data.map(d => d.state),
              label: 'States'
            }]}
            height={400}
            series={[{ 
              data: data.map(d => d.avgRate),
            }]}
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
                stroke: '#fff'
              },
 
            }}
          />
        </Box>
      </Box>
    </Container>
  )
}