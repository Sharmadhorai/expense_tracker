import React, { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'

export default function AddTransactionScreen({ navigation }) {
  const { user } = useAuth()
  const [type, setType]         = useState('expense')
  const [amount, setAmount]     = useState('')
  const [description, setDesc]  = useState('')
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCatId]  = useState(null)
  const [categories, setCategories] = useState([])
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data))
  }, [])

  const onSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) { Alert.alert('Error', 'Please enter a valid amount'); return }
    setSaving(true)
    try {
      await API.post('/transactions', {
        type, amount: parseFloat(amount),
        category_id: categoryId,
        description: description || null,
        date,
      })
      navigation.goBack()
    } catch(err) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={s.handle} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={s.title}>Add Transaction</Text>
        <TouchableOpacity onPress={onSave} disabled={saving} style={s.saveBtn}>
          {saving ? <ActivityIndicator color="white" size="small" />
            : <Text style={s.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Type toggle */}
        <View style={s.typeRow}>
          {['expense','income'].map(t => (
            <TouchableOpacity key={t} style={[s.typeBtn, type===t && s.typeBtnActive(t)]} onPress={() => setType(t)}>
              <Text style={[s.typeBtnText, type===t && s.typeBtnTextActive]}>
                {t==='income'?'📈 Income':'📉 Expense'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <View style={s.amountContainer}>
          <Text style={s.currencySymbol}>{user?.currency||'USD'}</Text>
          <TextInput
            style={s.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#3A3A5A"
          />
        </View>

        {/* Categories */}
        <Text style={s.sectionLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:20 }}>
          <View style={{ flexDirection:'row', gap:10, paddingHorizontal:2 }}>
            {categories.map(c => (
              <TouchableOpacity key={c.id} onPress={() => setCatId(c.id)}
                style={[s.catChip, categoryId===c.id && { backgroundColor:`${c.color}33`, borderColor:c.color }]}>
                <Text style={{ fontSize:20 }}>{c.icon}</Text>
                <Text style={[s.catLabel, categoryId===c.id && { color:'#F0F0FF' }]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Date */}
        <Text style={s.sectionLabel}>Date</Text>
        <TextInput
          style={s.dateInput}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#5A5A7A"
        />

        {/* Description */}
        <Text style={s.sectionLabel}>Description (optional)</Text>
        <TextInput
          style={[s.dateInput, { minHeight:80, textAlignVertical:'top' }]}
          value={description}
          onChangeText={setDesc}
          placeholder="What was this for?"
          placeholderTextColor="#5A5A7A"
          multiline
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#12122A', borderTopLeftRadius:24, borderTopRightRadius:24 },
  handle: { width:40, height:4, backgroundColor:'rgba(255,255,255,0.2)', borderRadius:2, alignSelf:'center', marginTop:12 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.07)' },
  cancel: { color:'#9090BB', fontSize:16 },
  title: { fontSize:17, fontWeight:'700', color:'#F0F0FF' },
  saveBtn: { backgroundColor:'#6C63FF', borderRadius:10, paddingHorizontal:16, paddingVertical:8 },
  saveText: { color:'white', fontWeight:'700', fontSize:14 },
  content: { padding:20, gap:4 },
  typeRow: { flexDirection:'row', gap:10, marginBottom:20 },
  typeBtn: { flex:1, padding:12, borderRadius:12, alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)' },
  typeBtnActive: t => ({
    backgroundColor: t==='income'?'rgba(0,212,170,0.15)':'rgba(255,101,132,0.15)',
    borderColor: t==='income'?'#00D4AA':'#FF6584',
  }),
  typeBtnText: { fontSize:14, fontWeight:'600', color:'#9090BB' },
  typeBtnTextActive: { color:'#F0F0FF' },
  amountContainer: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, marginBottom:28 },
  currencySymbol: { fontSize:28, color:'#9090BB', fontWeight:'300' },
  amountInput: { fontSize:52, fontWeight:'800', color:'#F0F0FF', minWidth:150, textAlign:'center' },
  sectionLabel: { fontSize:12, fontWeight:'600', color:'#9090BB', textTransform:'uppercase', letterSpacing:1, marginBottom:10 },
  catChip: { alignItems:'center', gap:4, padding:12, borderRadius:14, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', minWidth:70 },
  catLabel: { fontSize:11, color:'#9090BB', fontWeight:'500' },
  dateInput: { backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, padding:14, color:'#F0F0FF', fontSize:15, marginBottom:16 },
})
