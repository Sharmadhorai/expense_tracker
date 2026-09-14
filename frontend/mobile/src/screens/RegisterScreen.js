import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth()
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)

  const onRegister = async () => {
    const { name, email, password, confirm } = form
    if (!name || !email || !password) { Alert.alert('Error', 'Please fill all fields'); return }
    if (password !== confirm) { Alert.alert('Error', 'Passwords do not match'); return }
    if (password.length < 6)  { Alert.alert('Error', 'Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(name.trim(), email.trim(), password)
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.detail || 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, placeholder, opts={}) => (
    <>
      <Text style={s.label}>{placeholder}</Text>
      <TextInput style={s.input} placeholder={placeholder} placeholderTextColor="#5A5A7A"
        value={form[key]} onChangeText={v => setForm(f => ({...f, [key]:v}))}
        autoCapitalize={key==='name'?'words':'none'} {...opts} />
    </>
  )

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <View style={s.logo}><Text style={s.logoText}>💰</Text></View>
          <Text style={s.brand}>Create Account</Text>
          <Text style={s.tagline}>Start your financial journey</Text>
        </View>
        <View style={s.card}>
          {field('name',     'Full Name')}
          {field('email',    'Email Address', { keyboardType:'email-address', autoCorrect:false })}
          {field('password', 'Password',      { secureTextEntry:true })}
          {field('confirm',  'Confirm Password', { secureTextEntry:true })}

          <TouchableOpacity style={s.btn} onPress={onRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={s.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={s.link}>Already have an account? <Text style={{ color:'#6C63FF' }}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0D0D1A' },
  scroll: { flexGrow:1, justifyContent:'center', padding:24 },
  header: { alignItems:'center', marginBottom:28 },
  logo: { width:68, height:68, borderRadius:20, backgroundColor:'#1A1A35', alignItems:'center', justifyContent:'center', marginBottom:14, elevation:10 },
  logoText: { fontSize:32 },
  brand: { fontSize:24, fontWeight:'800', color:'#F0F0FF' },
  tagline: { fontSize:13, color:'#9090BB', marginTop:5 },
  card: { backgroundColor:'#12122A', borderRadius:20, padding:24, borderWidth:1, borderColor:'rgba(255,255,255,0.07)' },
  label: { fontSize:12, fontWeight:'600', color:'#9090BB', textTransform:'uppercase', letterSpacing:1, marginBottom:6 },
  input: { backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:10, padding:13, color:'#F0F0FF', fontSize:15, marginBottom:14 },
  btn: { backgroundColor:'#6C63FF', borderRadius:12, padding:15, alignItems:'center', marginTop:6, marginBottom:14, elevation:6 },
  btnText: { color:'white', fontWeight:'700', fontSize:15 },
  link: { textAlign:'center', color:'#9090BB', fontSize:13 },
})
