'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { supabase } from '@/lib/supabase'

import {
  Card,
  CardContent
} from '@/components/ui/card'

export default function RegisterPage() {

  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function register() {

    setError('')
    setSuccess('')

    if (!name || !email || !password) {

      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {

      // get current employee count
      const { data: employees } = await supabase
        .from('employees')
        .select('id')

      const nextNumber =
        String((employees?.length || 0) + 1)
          .padStart(3, '0')

      const employeeId = `EMP-${nextNumber}`

      const { error } = await supabase
        .from('employees')
        .insert([
          {
            empid: employeeId,
            name,
            email,
            password,
            role: 'employee'
          }
        ])

      if (error) {

        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(
        `Registration successful! Employee ID: ${employeeId}`
      )

      setName('')
      setEmail('')
      setPassword('')

      setTimeout(() => {

        router.push('/login')

      }, 1500)

    } catch (err) {

      setError('Something went wrong')
    }

    setLoading(false)
  }

  return (

    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-[#f5f8fc]
      "
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >

      <Card
        className="
          w-full
          max-w-md
          rounded-3xl
          bg-white/95
          shadow-2xl
        "
      >

        <CardContent className="p-10">

          <h1 className="text-3xl font-bold text-center mb-8">
            Register
          </h1>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="
                w-full
                h-12
                border
                rounded-lg
                px-3
              "
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="
                w-full
                h-12
                border
                rounded-lg
                px-3
              "
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="
                w-full
                h-12
                border
                rounded-lg
                px-3
              "
            />

            <button
              onClick={register}
              disabled={loading}
              className="
                w-full
                h-12
                bg-[#3b5b8a]
                text-white
                rounded-lg
              "
            >
              {loading
                ? 'Registering...'
                : 'Register'}
            </button>

            {error && (

              <p className="text-red-500 text-center">
                {error}
              </p>

            )}

            {success && (

              <p className="text-green-600 text-center">
                {success}
              </p>

            )}

            <Link
              href="/login"
              className="
                block
                text-center
                text-[#3b5b8a]
                mt-4
              "
            >
              Already have an account? Login
            </Link>

          </div>

        </CardContent>

      </Card>

    </div>

  )
}