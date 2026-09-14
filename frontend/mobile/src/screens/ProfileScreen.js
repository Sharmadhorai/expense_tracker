import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'

const CURRENCIES = ['USD','EUR','GBP','INR','JPY','CAD','AUD','SGD']

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth()

  const [name, setName]       = useState(user?.name || '')
  const [email, setEmail]     = useState(user?.email || '')
  const [currency, setCurrency] = useState(user?.currency || 'USD')
  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving]   = useState(false)
  const [savingPass, setSavingPass] = useState(false)

  const initials = user?.name?.slice(0,2).toUpperCase() || 'U'

  const onSaveProfile = async () => {
    setSaving(true)
    try {
      await API.put('/auth/me', { name, email, currency })
      await refreshUser()
      Alert.alert('Success', 'Profile updated!')
    } catch(err) {
      Alert.alert('Error', err.response?.data?.detail || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const onChangePass = async () => {
    if (newPass !== confirm) { Alert.alert('Error', 'Passwords do not match'); return }
    if (newPass.length < 6)  { Alert.alert('Error', 'Min 6 characters'); return }
    setSavingPass(true)
    try {
      await API.put('/auth/me', { current_password: curPass, new_password: newPass })
      setCurPass(''); setNewPass(''); setConfirm('')
      Alert.alert('Success', 'Password changed!')
    } catch(err) {
      Alert.alert('Error', err.response?.data?.detail || 'Password change failed')
    } finally {
      setSavingPass(false)
    }
  }

  const onLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text:'Cancel', style:'cancel' },
      { text:'Logout', style:'destructive', onPress: logout }
    ])
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.headerTitle}>Profile</Text>

      {/* Avatar */}
      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <Text style={s.nameText}>{user?.name}</Text>
        <Text style={s.emailText}>{user?.email}</Text>
      </View>

      {/* Profile form */}
      <View style={s.card}>
        <Text style={s.cardTitle}><Ionicons name="person" size={15} /> Personal Information</Text>
        <Text style={s.label}>Full Name</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} />
        <Text style={s.label}>Email</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Text style={s.label}>Currency</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
          <View style={{ flexDirection:'row', gap:8 }}>
            {CURRENCIES.map(c => (
              <TouchableOpacity key={c} onPress={() => setCurrency(c)}
                style={[s.curChip, currency===c && s.curChipActive]}>
                <Text style={[s.curText, currency===c && { color:'white' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity style={s.btn} onPress={onSaveProfile} disabled={saving}>
          {saving ? <ActivityIndicator color="white" size="small" />
            : <Text style={s.btnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>

      {/* Password */}
      <View style={s.card}>
        <Text style={s.cardTitle}><Ionicons name="lock-closed" size={15} /> Change Password</Text>
        <Text style={s.label}>Current Password</Text>
        <TextInput style={s.input} value={curPass} onChangeText={setCurPass} secureTextEntry />
        <Text style={s.label}>New Password</Text>
        <TextInput style={s.input} value={newPass} onChangeText={setNewPass} secureTextEntry />
        <Text style={s.label}>Confirm Password</Text>
        <TextInput style={s.input} value={confirm} onChangeText={setConfirm} secureTextEntry />
        <TouchableOpacity style={s.btn} onPress={onChangePass} disabled={savingPass}>
          {savingPass ? <ActivityIndicator color="white" size="small" />
            : <Text style={s.btnText}>Update Password</Text>}
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color="#FF6584" />
        <Text style={s.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0D0D1A' },
  content: { padding:20, paddingTop:56, paddingBottom:40 },
  headerTitle: { fontSize:24, fontWeight:'800', color:'#F0F0FF', marginBottom:24 },
  avatarSection: { alignItems:'center', marginBottom:24 },
  avatar: { width:76, height:76, borderRadius:38, backgroundColor:'#6C63FF', alignItems:'center', justifyContent:'center', marginBottom:12, elevation:8 },
  avatarText: { color:'white', fontSize:26, fontWeight:'800' },
  nameText: { fontSize:19, fontWeight:'700', color:'#F0F0FF' },
  emailText: { fontSize:13, color:'#9090BB', marginTop:4 },
  card: { backgroundColor:'#12122A', borderRadius:18, padding:18, marginBottom:16, borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  cardTitle: { fontSize:14, fontWeight:'700', color:'#F0F0FF', marginBottom:16 },
  label: { fontSize:11, fontWeight:'600', color:'#9090BB', textTransform:'uppercase', letterSpacing:1, marginBottom:6 },
  input: { backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:10, padding:13, color:'#F0F0FF', fontSize:15, marginBottom:14 },
  btn: { backgroundColor:'#6C63FF', borderRadius:12, padding:14, alignItems:'center', elevation:4 },
  btnText: { color:'white', fontWeight:'700', fontSize:15 },
  curChip: { paddingHorizontal:14, paddingVertical:8, borderRadius:10, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)' },
  curChipActive: { backgroundColor:'#6C63FF', borderColor:'#6C63FF' },
  curText: { color:'#9090BB', fontWeight:'600', fontSize:13 },
  logoutBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:'rgba(255,101,132,0.1)', borderWidth:1, borderColor:'rgba(255,101,132,0.25)', borderRadius:14, padding:16, marginTop:4 },
  logoutText: { color:'#FF6584', fontWeight:'700', fontSize:15 },
})
