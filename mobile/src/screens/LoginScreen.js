import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen({ navigation }) {
  const { login } = useAuth()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return }
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <View style={s.logo}><Text style={s.logoText}>💰</Text></View>
          <Text style={s.brand}>Expense<Text style={{ color:'#6C63FF' }}>Track</Text></Text>
          <Text style={s.tagline}>Take control of your finances</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          <Text style={s.title}>Welcome back</Text>
          <Text style={s.subtitle}>Sign in to your account</Text>

          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor="#5A5A7A"
            value={email} onChangeText={setEmail} keyboardType="email-address"
            autoCapitalize="none" autoCorrect={false} />

          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} placeholder="••••••••" placeholderTextColor="#5A5A7A"
            value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={s.btn} onPress={onLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={s.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={s.link}>Don't have an account? <Text style={{ color:'#6C63FF' }}>Sign up</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0D0D1A' },
  scroll: { flexGrow:1, justifyContent:'center', padding:24 },
  header: { alignItems:'center', marginBottom:32 },
  logo: {
    width:76, height:76, borderRadius:22, marginBottom:16,
    backgroundColor:'#1A1A35', alignItems:'center', justifyContent:'center',
    shadowColor:'#6C63FF', shadowOpacity:0.5, shadowRadius:20, shadowOffset:{width:0,height:0},
    elevation:10,
  },
  logoText: { fontSize:36 },
  brand: { fontSize:28, fontWeight:'800', color:'#F0F0FF', letterSpacing:-0.5 },
  tagline: { fontSize:14, color:'#9090BB', marginTop:6 },
  card: {
    backgroundColor:'#12122A',
    borderRadius:20, padding:24,
    borderWidth:1, borderColor:'rgba(255,255,255,0.07)',
  },
  title: { fontSize:22, fontWeight:'800', color:'#F0F0FF', marginBottom:4 },
  subtitle: { fontSize:14, color:'#9090BB', marginBottom:24 },
  label: { fontSize:12, fontWeight:'600', color:'#9090BB', textTransform:'uppercase', letterSpacing:1, marginBottom:6 },
  input: {
    backgroundColor:'rgba(255,255,255,0.05)',
    borderWidth:1, borderColor:'rgba(255,255,255,0.08)',
    borderRadius:10, padding:14, color:'#F0F0FF', fontSize:15,
    marginBottom:16,
  },
  btn: {
    backgroundColor:'#6C63FF', borderRadius:12, padding:16,
    alignItems:'center', marginTop:8, marginBottom:16,
    shadowColor:'#6C63FF', shadowOpacity:0.4, shadowRadius:12, shadowOffset:{width:0,height:4},
  },
  btnText: { color:'white', fontWeight:'700', fontSize:16 },
  link: { textAlign:'center', color:'#9090BB', fontSize:14 },
})
