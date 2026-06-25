'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const formatKLTime = (dateString) => {
  if (!dateString) return '-'

  return new Intl.DateTimeFormat('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date(dateString))
}

const getKLTime = () => {
  return new Date().toISOString()
}

const calculateHours = (clockIn, clockOut) => {
  if (!clockIn || !clockOut) return '-'

  const inTime = new Date(clockIn)
  const outTime = new Date(clockOut)

  const diffMs = outTime - inTime
  const diffHours = diffMs / (1000 * 60 * 60)

  return diffHours.toFixed(2) + ' hrs'
}

export default function ClockInOutPage() {
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState(null)
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('')
  const [history, setHistory] = useState([])
  const [isClockingOut, setIsClockingOut] = useState(false)

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))

    if (!user) {
      router.push('/login')
      return
    }

    setCurrentUser(user)
  }, [])

  // =========================
  // LIVE CLOCK
  // =========================
  useEffect(() => {
    function updateClock() {
      const now = new Date()

      const formatterTime = new Intl.DateTimeFormat('en-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })

      const formatterDate = new Intl.DateTimeFormat('en-MY', {
        timeZone: 'Asia/Kuala_Lumpur',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })

      setTime(formatterTime.format(now))
      setDate(formatterDate.format(now))
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)

    return () => clearInterval(interval)
  }, [])

  // =========================
  // LOAD HISTORY
  // =========================
  useEffect(() => {
    if (currentUser) fetchHistory()
  }, [currentUser])

  async function fetchHistory() {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', currentUser.id)
      .order('id', { ascending: false })

    if (!error) setHistory(data)
  }

  // =========================
  // CLOCK IN
  // =========================
  async function clockIn() {
    if (!currentUser?.id) {
      setStatus('❌ User not loaded')
      return
    }

    const today = new Date().toLocaleDateString('en-CA')

    const { data, error } = await supabase
      .from('attendance')
      .select('id, clock_in')
      .eq('employee_id', currentUser.id)
      .order('id', { ascending: false })

    if (error) {
      setStatus('❌ Error checking attendance')
      return
    }

    const todayRecord = data?.find(
      (a) =>
        a.clock_in &&
        new Date(a.clock_in).toLocaleDateString('en-CA') === today
    )

    if (todayRecord) {
      setStatus('⚠️ You have already clocked in today')
      return
    }

    const { error: insertError } = await supabase
      .from('attendance')
      .insert([
        {
          employee_id: currentUser.id,
          clock_in: new Date().toISOString()
        }
      ])

    if (insertError) {
      setStatus('❌ Failed to clock in')
      return
    }

    setStatus('✅ Clocked IN successfully')
    fetchHistory()
  }

  // =========================
  // CLOCK OUT
  // =========================
  async function clockOut() {
    if (isClockingOut) return

    setIsClockingOut(true)

    try {
      if (!currentUser?.id) {
        setStatus('❌ User not loaded')
        return
      }

      const { data, error } = await supabase
        .from('attendance')
        .select('id, clock_out')
        .eq('employee_id', currentUser.id)
        .is('clock_out', null)
        .order('id', { ascending: false })
        .limit(1)

      if (error) {
        setStatus('❌ Error fetching record')
        return
      }

      if (!data || data.length === 0) {
        setStatus('⚠️ Clock IN first')
        return
      }

      const record = data[0]

      const { error: updateError } = await supabase
        .from('attendance')
        .update({ clock_out: new Date().toISOString() })
        .eq('id', record.id)

      if (updateError) {
        setStatus('❌ Failed to clock out')
        return
      }

      setStatus('✅ Clocked OUT successfully')
      fetchHistory()
    } finally {
      setIsClockingOut(false)
    }
  }

  // =========================
  // LOGOUT
  // =========================
  function logout() {
    localStorage.removeItem('currentUser')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex bg-[#eaf1f8]">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#3b5b8a] text-white min-h-screen">

        <div className="p-6 border-b border-white/20">
          <img src="/logo.png" className="w-36 bg-white p-2 rounded-md" />
        </div>

        <div className="flex flex-col mt-4">
          <Link href="/clockin-out" className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold">
            Clock In / Out
          </Link>

          <Link href="/view-payslip" className="px-6 py-4 hover:bg-white/10">
            View Payslip
          </Link>

          <Link href="/apply-leave" className="px-6 py-4 hover:bg-white/10">
            Apply Leave
          </Link>

          <button onClick={logout} className="px-6 py-4 text-left hover:bg-white/10">
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">

        {/* TOPBAR */}
        <div className="flex justify-between border-b pb-5 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#3b5b8a]">
              Hello {currentUser?.name} 👋
            </h2>
            <p className="text-gray-500">
              Home &gt; Employee &gt; Clock In/Out
            </p>
          </div>
        </div>

        {/* CLOCK CARD */}
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-10 text-center">

            <h1 className="text-6xl font-bold text-[#3b5b8a]">
              {time}
            </h1>

            <p className="text-gray-500 mt-3">
              {date}
            </p>

            <div className="flex justify-center gap-6 mt-10">

              <Button onClick={clockIn} className="h-24 w-32 bg-[#3b5b8a]">
                IN
              </Button>

              <Button onClick={clockOut} className="h-24 w-32 bg-gray-600">
                OUT
              </Button>

            </div>

            {status && (
              <p className="mt-6 font-medium">{status}</p>
            )}

          </CardContent>
        </Card>

        {/* HISTORY */}
        <Card className="mt-10">
          <CardContent className="p-8">

            <h2 className="text-2xl font-bold text-[#3b5b8a] mb-6">
              Attendance History
            </h2>

            {history.length === 0 ? (
              <p>No records yet</p>
            ) : (
              <table className="w-full">

                <thead>
                  <tr className="border-b">
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Hours</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td>{formatKLTime(r.clock_in)}</td>
                      <td>{formatKLTime(r.clock_out)}</td>
                      <td>{calculateHours(r.clock_in, r.clock_out)}</td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  )
}