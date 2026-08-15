import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { BarChart } from 'react-native-chart-kit'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'

const screenWidth = Dimensions.get('window').width - 40

const fmt = (n, cur='USD') => {
  try { return new Intl.NumberFormat('en-US',{style:'currency',currency:cur,maximumFractionDigits:0}).format(n||0) }
  catch { return `$${(n||0).toFixed(0)}` }
}

const chartConfig = {
  backgroundColor: '#12122A',
  backgroundGradientFrom: '#12122A',
  backgroundGradientTo: '#12122A',
  decimalPlaces: 0,
  color: (opacity=1) => `rgba(108,99,255,${opacity})`,
  labelColor: () => '#9090BB',
  style: { borderRadius:16 },
  propsForDots: { r:'4', strokeWidth:'2', stroke:'#6C63FF' },
  barPercentage: 0.6,
}

export default function ReportsScreen() {
  const { user } = useAuth()
  const cur = user?.currency || 'USD'
  const now = new Date()

  const [summary, setSummary]   = useState(null)
  const [trend, setTrend]       = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, trendRes, brkRes] = await Promise.all([
        API.get('/reports/summary'),
        API.get(`/reports/trend?period=monthly&year=${now.getFullYear()}`),
        API.get('/reports/category-breakdown?type=expense'),
      ])
      setSummary(sumRes.data)
      setTrend(trendRes.data)
      setBreakdown(brkRes.data.slice(0, 6))
    } catch(e) { console.log(e.message) }
    finally { setLoading(false) }
  }, [])

  useFocusEffect(useCallback(() => { setLoading(true); fetchData() }, [fetchData]))

  const income   = parseFloat(summary?.total_income   || 0)
  const expenses = parseFloat(summary?.total_expenses || 0)
  const net      = income - expenses

  // Prepare chart data
  const chartLabels  = trend.slice(-6).map(t => t.label)
  const incomeData   = trend.slice(-6).map(t => parseFloat(t.income  || 0))
  const expenseData  = trend.slice(-6).map(t => parseFloat(t.expense || 0))

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.headerTitle}>Reports</Text>

      {/* Summary cards */}
      <View style={s.summaryRow}>
        {[
          { label:'Income',   value:fmt(income,cur),   color:'#00D4AA' },
          { label:'Expenses', value:fmt(expenses,cur), color:'#FF6584' },
          { label:'Net',      value:fmt(net,cur),      color: net>=0?'#00D4AA':'#FF6584' },
        ].map((s2,i) => (
          <View key={i} style={s.summaryCard}>
            <Text style={s.summaryLabel}>{s2.label}</Text>
            <Text style={[s.summaryValue, { color:s2.color }]}>{s2.value}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop:40 }} />
      ) : (
        <>
          {/* Bar chart */}
          {trend.length > 0 && (
            <View style={s.chartCard}>
              <Text style={s.chartTitle}>📊 Monthly Income vs Expenses</Text>
              <BarChart
                data={{ labels:chartLabels, datasets:[{ data:incomeData, color:()=>'#00D4AA' }, { data:expenseData, color:()=>'#FF6584' }] }}
                width={screenWidth - 32}
                height={200}
                chartConfig={chartConfig}
                style={{ borderRadius:12, marginTop:8 }}
                showBarTops={false}
                fromZero
              />
            </View>
          )}

          {/* Category breakdown */}
          {breakdown.length > 0 && (
            <View style={s.chartCard}>
              <Text style={s.chartTitle}>🍕 Top Expense Categories</Text>
              {breakdown.map((b,i) => {
                const pct = b.percentage
                return (
                  <View key={i} style={{ marginTop:12 }}>
                    <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:6 }}>
                      <Text style={{ color:'#F0F0FF', fontSize:13 }}>
                        <Text style={{ marginRight:6 }}>{b.category_icon}</Text> {b.category_name}
                      </Text>
                      <Text style={{ color:'#FF6584', fontWeight:'700', fontSize:13 }}>{fmt(b.total, cur)}</Text>
                    </View>
                    <View style={{ height:6, backgroundColor:'rgba(255,255,255,0.07)', borderRadius:99, overflow:'hidden' }}>
                      <View style={{ height:'100%', width:`${pct}%`, backgroundColor:b.category_color||'#6C63FF', borderRadius:99 }} />
                    </View>
                    <Text style={{ color:'#5A5A7A', fontSize:11, marginTop:2 }}>{pct.toFixed(1)}%</Text>
                  </View>
                )
              })}
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0D0D1A' },
  content: { padding:20, paddingTop:56, paddingBottom:40 },
  headerTitle: { fontSize:24, fontWeight:'800', color:'#F0F0FF', marginBottom:20 },
  summaryRow: { flexDirection:'row', gap:10, marginBottom:20 },
  summaryCard: { flex:1, backgroundColor:'#12122A', borderRadius:14, padding:14, borderWidth:1, borderColor:'rgba(255,255,255,0.07)' },
  summaryLabel: { fontSize:11, color:'#9090BB', marginBottom:4 },
  summaryValue: { fontSize:16, fontWeight:'800' },
  chartCard: { backgroundColor:'#12122A', borderRadius:18, padding:16, marginBottom:16, borderWidth:1, borderColor:'rgba(255,255,255,0.07)' },
  chartTitle: { fontSize:14, fontWeight:'700', color:'#F0F0FF' },
})
