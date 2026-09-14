import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'

const fmt = (n, currency='USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style:'currency', currency, maximumFractionDigits:0 }).format(n || 0)
  } catch { return `$${(n||0).toFixed(0)}` }
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth()
  const cur = user?.currency || 'USD'
  const now = new Date()

  const [summary, setSummary]   = useState(null)
  const [recent, setRecent]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, recRes] = await Promise.all([
        API.get('/reports/summary'),
        API.get('/reports/recent-transactions?limit=5'),
      ])
      setSummary(sumRes.data)
      setRecent(recRes.data)
    } catch(e) {
      console.log('Dashboard fetch error:', e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { setLoading(true); fetchData() }, [fetchData]))

  const onRefresh = () => { setRefreshing(true); fetchData() }

  if (loading) return (
    <View style={[s.container, { justifyContent:'center', alignItems:'center' }]}>
      <ActivityIndicator size="large" color="#6C63FF" />
    </View>
  )

  const income   = parseFloat(summary?.total_income  || 0)
  const expenses = parseFloat(summary?.total_expenses || 0)
  const balance  = income - expenses

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{greeting},</Text>
          <Text style={s.name}>{user?.name?.split(' ')[0]} 👋</Text>
        </View>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.slice(0,2).toUpperCase()}</Text>
        </View>
      </View>

      {/* Balance card */}
      <View style={s.balanceCard}>
        <Text style={s.balanceLabel}>Total Balance</Text>
        <Text style={[s.balanceValue, { color: balance >= 0 ? '#00D4AA' : '#FF6584' }]}>
          {fmt(balance, cur)}
        </Text>
        <View style={s.balanceRow}>
          <View style={s.balanceItem}>
            <Text style={s.balanceItemLabel}>📈 Income</Text>
            <Text style={[s.balanceItemValue, { color:'#00D4AA' }]}>{fmt(income, cur)}</Text>
          </View>
          <View style={[s.balanceItem, { borderLeftWidth:1, borderLeftColor:'rgba(255,255,255,0.1)', paddingLeft:16 }]}>
            <Text style={s.balanceItemLabel}>📉 Expenses</Text>
            <Text style={[s.balanceItemValue, { color:'#FF6584' }]}>{fmt(expenses, cur)}</Text>
          </View>
        </View>
      </View>

      {/* Quick add button */}
      <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddTransaction')}>
        <Text style={s.addBtnText}>+ Add Transaction</Text>
      </TouchableOpacity>

      {/* Recent transactions */}
      <Text style={s.sectionTitle}>Recent Transactions</Text>
      {recent.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>💸</Text>
          <Text style={s.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        recent.map(t => (
          <View key={t.id} style={s.txItem}>
            <View style={[s.txIcon, { backgroundColor: `${t.category?.color || '#6C63FF'}22` }]}>
              <Text style={{ fontSize:18 }}>{t.category?.icon || '📦'}</Text>
            </View>
            <View style={s.txInfo}>
              <Text style={s.txCat}>{t.category?.name || 'Uncategorized'}</Text>
              <Text style={s.txDesc}>{t.description || new Date(t.date).toLocaleDateString()}</Text>
            </View>
            <Text style={[s.txAmount, { color: t.type==='income'?'#00D4AA':'#FF6584' }]}>
              {t.type==='income'?'+':'-'}{fmt(t.amount, cur)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0D0D1A' },
  content: { padding:20, paddingBottom:32 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
  greeting: { fontSize:14, color:'#9090BB' },
  name: { fontSize:24, fontWeight:'800', color:'#F0F0FF' },
  avatar: {
    width:44, height:44, borderRadius:22,
    backgroundColor:'#6C63FF', alignItems:'center', justifyContent:'center',
  },
  avatarText: { color:'white', fontWeight:'700', fontSize:15 },
  balanceCard: {
    backgroundColor:'#12122A', borderRadius:20, padding:22,
    borderWidth:1, borderColor:'rgba(108,99,255,0.2)',
    marginBottom:16,
    shadowColor:'#6C63FF', shadowOpacity:0.15, shadowRadius:20, shadowOffset:{width:0,height:4},
    elevation:6,
  },
  balanceLabel: { fontSize:13, color:'#9090BB', marginBottom:4 },
  balanceValue: { fontSize:36, fontWeight:'800', marginBottom:20, letterSpacing:-1 },
  balanceRow: { flexDirection:'row', gap:16 },
  balanceItem: { flex:1 },
  balanceItemLabel: { fontSize:12, color:'#9090BB', marginBottom:4 },
  balanceItemValue: { fontSize:18, fontWeight:'700' },
  addBtn: {
    backgroundColor:'#6C63FF', borderRadius:14, padding:16,
    alignItems:'center', marginBottom:24,
    shadowColor:'#6C63FF', shadowOpacity:0.4, shadowRadius:12, shadowOffset:{width:0,height:4},
    elevation:8,
  },
  addBtnText: { color:'white', fontWeight:'700', fontSize:16 },
  sectionTitle: { fontSize:16, fontWeight:'700', color:'#F0F0FF', marginBottom:12 },
  emptyState: { alignItems:'center', padding:32 },
  emptyIcon: { fontSize:40, marginBottom:8, opacity:0.4 },
  emptyText: { color:'#5A5A7A', fontSize:14 },
  txItem: {
    flexDirection:'row', alignItems:'center', gap:12,
    backgroundColor:'#12122A', borderRadius:14, padding:14, marginBottom:8,
    borderWidth:1, borderColor:'rgba(255,255,255,0.05)',
  },
  txIcon: { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center' },
  txInfo: { flex:1 },
  txCat: { fontSize:14, fontWeight:'600', color:'#F0F0FF' },
  txDesc: { fontSize:12, color:'#9090BB', marginTop:2 },
  txAmount: { fontSize:15, fontWeight:'700' },
})
