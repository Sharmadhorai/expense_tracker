import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert, ActivityIndicator
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'

const fmt = (n, cur='USD') => {
  try { return new Intl.NumberFormat('en-US',{style:'currency',currency:cur,maximumFractionDigits:0}).format(n||0) }
  catch { return `$${(n||0).toFixed(0)}` }
}

export default function TransactionsScreen({ navigation }) {
  const { user } = useAuth()
  const cur = user?.currency || 'USD'

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab]           = useState('all')

  const fetch = useCallback(async () => {
    try {
      const params = {}
      if (tab !== 'all') params.type = tab
      const res = await API.get('/transactions', { params })
      setTransactions(res.data)
    } catch(e) { console.log(e.message) }
    finally { setLoading(false); setRefreshing(false) }
  }, [tab])

  useFocusEffect(useCallback(() => { setLoading(true); fetch() }, [fetch]))

  const onDelete = async id => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text:'Cancel', style:'cancel' },
      { text:'Delete', style:'destructive', onPress: async () => {
        await API.delete(`/transactions/${id}`)
        fetch()
      }}
    ])
  }

  const renderItem = ({ item: t }) => (
    <View style={s.txItem}>
      <View style={[s.txIcon, { backgroundColor:`${t.category?.color||'#6C63FF'}22` }]}>
        <Text style={{ fontSize:18 }}>{t.category?.icon || '📦'}</Text>
      </View>
      <View style={s.txInfo}>
        <Text style={s.txCat}>{t.category?.name || 'Uncategorized'}</Text>
        <Text style={s.txDesc}>{t.description || '—'}</Text>
        <Text style={s.txDate}>{new Date(t.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</Text>
      </View>
      <View style={s.txRight}>
        <Text style={[s.txAmount, { color:t.type==='income'?'#00D4AA':'#FF6584' }]}>
          {t.type==='income'?'+':'-'}{fmt(t.amount, cur)}
        </Text>
        <TouchableOpacity onPress={() => onDelete(t.id)} style={s.deleteBtn}>
          <Ionicons name="trash-outline" size={14} color="#FF6584" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Transactions</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddTransaction')}>
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {['all','income','expense'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab===t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab===t && s.tabTextActive]}>
              {t==='all'?'All':t==='income'?'📈 Income':'📉 Expense'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true);fetch()}} tintColor="#6C63FF" />}
          contentContainerStyle={{ padding:16, paddingBottom:80, gap:8 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>💸</Text>
              <Text style={s.emptyText}>No transactions found</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0D0D1A' },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, paddingTop:56 },
  headerTitle: { fontSize:24, fontWeight:'800', color:'#F0F0FF' },
  addBtn: { width:40, height:40, borderRadius:12, backgroundColor:'#6C63FF', alignItems:'center', justifyContent:'center' },
  tabs: { flexDirection:'row', gap:6, paddingHorizontal:16, marginBottom:8 },
  tab: { flex:1, padding:9, borderRadius:10, backgroundColor:'rgba(255,255,255,0.05)', alignItems:'center' },
  tabActive: { backgroundColor:'#6C63FF' },
  tabText: { fontSize:12, fontWeight:'600', color:'#9090BB' },
  tabTextActive: { color:'white' },
  txItem: { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#12122A', borderRadius:14, padding:14, borderWidth:1, borderColor:'rgba(255,255,255,0.05)' },
  txIcon: { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center' },
  txInfo: { flex:1 },
  txCat: { fontSize:14, fontWeight:'600', color:'#F0F0FF' },
  txDesc: { fontSize:12, color:'#9090BB', marginTop:2 },
  txDate: { fontSize:11, color:'#5A5A7A', marginTop:2 },
  txRight: { alignItems:'flex-end', gap:6 },
  txAmount: { fontSize:15, fontWeight:'700' },
  deleteBtn: { padding:4 },
  empty: { alignItems:'center', paddingTop:60 },
  emptyIcon: { fontSize:40, opacity:0.4, marginBottom:8 },
  emptyText: { color:'#5A5A7A', fontSize:14 },
})
