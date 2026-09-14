import React, { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'

const fmt = (n, cur='USD') => {
  try { return new Intl.NumberFormat('en-US',{style:'currency',currency:cur,maximumFractionDigits:0}).format(n||0) }
  catch { return `$${(n||0).toFixed(0)}` }
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function BudgetScreen() {
  const { user } = useAuth()
  const cur = user?.currency || 'USD'
  const now = new Date()

  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear]   = useState(now.getFullYear())
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await API.get(`/budgets?month=${month}&year=${year}`)
      setBudgets(res.data)
    } catch(e) { console.log(e.message) }
    finally { setLoading(false); setRefreshing(false) }
  }, [month, year])

  useFocusEffect(useCallback(() => { setLoading(true); fetchBudgets() }, [fetchBudgets]))

  const getColor = (spent, budget) => {
    const pct = (spent/budget)*100
    if (pct >= 100) return '#FF6584'
    if (pct >= 80)  return '#FF9F43'
    return '#00D4AA'
  }

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y-1) }
    else setMonth(m => m-1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y+1) }
    else setMonth(m => m+1)
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true);fetchBudgets()}} tintColor="#6C63FF" />}>

      <Text style={s.headerTitle}>Budget</Text>

      {/* Month navigator */}
      <View style={s.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={s.navBtn}><Text style={s.navArrow}>‹</Text></TouchableOpacity>
        <Text style={s.monthLabel}>{MONTHS[month-1]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} style={s.navBtn}><Text style={s.navArrow}>›</Text></TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop:40 }} />
      ) : budgets.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>💳</Text>
          <Text style={s.emptyText}>No budgets for {MONTHS[month-1]} {year}</Text>
          <Text style={s.emptySubText}>Set budgets from the web app</Text>
        </View>
      ) : (
        budgets.map(b => {
          const spent  = parseFloat(b.spent  || 0)
          const budget = parseFloat(b.amount)
          const pct    = Math.min((spent/budget)*100, 100)
          const color  = getColor(spent, budget)
          const remaining = parseFloat(b.remaining)

          return (
            <View key={b.id} style={s.budgetCard}>
              <View style={s.budgetHeader}>
                <View style={[s.catIcon, { backgroundColor:`${b.category?.color||'#6C63FF'}22` }]}>
                  <Text style={{ fontSize:20 }}>{b.category?.icon || '💼'}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={s.catName}>{b.category?.name || 'Overall Budget'}</Text>
                  <Text style={s.budgetAmt}>{fmt(budget, cur)}</Text>
                </View>
                <View style={{ alignItems:'flex-end' }}>
                  <Text style={{ color:'#9090BB', fontSize:12 }}>Spent</Text>
                  <Text style={{ color:'#F0F0FF', fontWeight:'700', fontSize:15 }}>{fmt(spent, cur)}</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={s.barTrack}>
                <View style={[s.barFill, { width:`${pct}%`, backgroundColor:color }]} />
              </View>

              <View style={s.budgetFooter}>
                <Text style={{ color:'#9090BB', fontSize:12 }}>{pct.toFixed(0)}% used</Text>
                <Text style={{ color: remaining>=0?'#00D4AA':'#FF6584', fontWeight:'700', fontSize:13 }}>
                  {remaining>=0 ? `${fmt(remaining,cur)} left` : `${fmt(Math.abs(remaining),cur)} over`}
                </Text>
              </View>
            </View>
          )
        })
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0D0D1A' },
  content: { padding:20, paddingTop:56, paddingBottom:40 },
  headerTitle: { fontSize:24, fontWeight:'800', color:'#F0F0FF', marginBottom:20 },
  monthNav: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#12122A', borderRadius:14, padding:4, marginBottom:20, borderWidth:1, borderColor:'rgba(255,255,255,0.07)' },
  navBtn: { padding:10 },
  navArrow: { fontSize:22, color:'#9090BB', fontWeight:'300' },
  monthLabel: { fontSize:15, fontWeight:'700', color:'#F0F0FF' },
  empty: { alignItems:'center', paddingTop:48 },
  emptyIcon: { fontSize:44, opacity:0.35, marginBottom:12 },
  emptyText: { color:'#9090BB', fontSize:15, fontWeight:'600' },
  emptySubText: { color:'#5A5A7A', fontSize:13, marginTop:4 },
  budgetCard: { backgroundColor:'#12122A', borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  budgetHeader: { flexDirection:'row', alignItems:'center', gap:12, marginBottom:14 },
  catIcon: { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center' },
  catName: { fontSize:15, fontWeight:'700', color:'#F0F0FF' },
  budgetAmt: { fontSize:12, color:'#9090BB', marginTop:2 },
  barTrack: { height:8, backgroundColor:'rgba(255,255,255,0.07)', borderRadius:99, overflow:'hidden', marginBottom:10 },
  barFill: { height:'100%', borderRadius:99 },
  budgetFooter: { flexDirection:'row', justifyContent:'space-between' },
})
