'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Card,
  CardContent
} from '@/components/ui/card'

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  

  async function login() {
    setError('')
  
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
  
    setLoading(true)
  
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single()
  
    setLoading(false)
  
    if (error || !data) {
      setError('Invalid email or password')
      return
    }
  
    localStorage.setItem('user', JSON.stringify(data))
  
    // ✅ ROLE-BASED REDIRECT (THIS IS THE FIX)
    if (data.role === 'admin') {
      router.push('/admin')   // 👈 admin dashboard page
    } else {
      router.push('/clockin-out') // 👈 employee page
    }
  }
     
  return (

    <div className="min-h-screen bg-white">

    

{/* BACKGROUND */}

<div
  className="
    min-h-screen
    flex
    items-center
    justify-center
    bg-[#f5f8fc]
  "
>
  <img
    src="/bg.png"
    alt="JED Pump Background"
    className="
      h-full
      w-auto
      object-contain
    "
  />
</div>
      {/* LOGIN CARD */}
      <div className="absolute inset-0 flex items-center justify-center">

      <Card
  className="
    w-full
    max-w-md
    rounded-3xl
    border
    border-white/30
    bg-white/80
    backdrop-blur-md
    shadow-2xl
  "
>

          <CardContent className="p-10">

            <h1 className="text-3xl font-bold text-center mb-8">
              Login
            </h1>

            <div className="space-y-5">

              {/* EMAIL */}
              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Email
                </label>

                <Input
                  type="email"
                  placeholder="company@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="h-12"
                />

              </div>

              {/* PASSWORD */}
              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Password
                </label>

                <div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    placeholder="Enter password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="h-12 pr-20"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#3b5b8a]"
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

              </div>

              {/* FORGOT */}
              <p className="text-sm text-[#3b5b8a] cursor-pointer">

                Forgot Your Password?

              </p>

              {/* BUTTON */}
              <Button
                onClick={login}
                disabled={loading}
                className="
                  w-full
                  h-12
                  bg-[#3b5b8a]
                  hover:bg-[#2f4c75]
                "
              >

                {loading ? 'Logging in...' : 'Login'}

              </Button>

              {/* ERROR */}
              {error && (

                <p className="text-red-500 text-sm">

                  {error}

                </p>

              )}

<Link
  href="/register"
  className="text-sm text-[#3b5b8a]"
>
  Don’t have account? Register
</Link>

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  )
}