'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/button'

import {
  Card,
  CardContent
} from '@/components/ui/card'

export default function ClockInOutPage() {

  const [currentUser, setCurrentUser] = useState(null)

  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  const [status, setStatus] = useState('')
  const [history, setHistory] = useState([])

  const [isClockingOut, setIsClockingOut] = useState(false)

  //////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////

  useEffect(() => {

    const user = JSON.parse(
      localStorage.getItem('currentUser')
    )

    if (!user) {

      router.push('/login')
      return
    }

    setCurrentUser(user)

  }, [])

  //////////////////////////////////////////////////
  // LIVE CLOCK
  //////////////////////////////////////////////////

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
  //////////////////////////////////////////////////
  // LOAD ATTENDANCE HISTORY
  //////////////////////////////////////////////////

  useEffect(() => {

    if (currentUser) {

      fetchHistory()
    }

  }, [currentUser])

  async function fetchHistory() {

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', currentUser.id)
      .order('id', { ascending: false })

    if (!error) {

      setHistory(data)
    }
  }

  //////////////////////////////////////////////////
  // CLOCK IN
  //////////////////////////////////////////////////

  async function clockIn() {

    const today = new Date().toLocaleDateString('en-CA')
  
    // STEP 1: check existing record for today
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', currentUser.id)
  
    if (error) {
      setStatus('❌ Error checking attendance')
      return
    }
  
    const todayRecord = data?.find((a) =>
      a.clock_in &&
      new Date(a.clock_in).toLocaleDateString('en-CA') === today
    )
  
    // STEP 2: BLOCK duplicate clock-in
    if (todayRecord) {
      setStatus('⚠️ You have already clocked in today')
      return
    }
  
    // STEP 3: INSERT ONLY IF NOT EXISTS
    const { error: insertError } = await supabase
      .from('attendance')
      .insert([
        {
          employee_id: currentUser.id,
          clock_in: new Date().toISOString()
        }
      ])
  
    if (insertError) {
      console.log(insertError)
      setStatus('❌ Failed to clock in')
    } else {
      setStatus('✅ Clocked IN successfully')
  
      // refresh history
      fetchHistory()
    }
  }

  //////////////////////////////////////////////////
  // CLOCK OUT
  //////////////////////////////////////////////////

  async function clockOut() {

    // 🔒 PREVENT DOUBLE CLICK
    if (isClockingOut) return
    setIsClockingOut(true)
  
    try {
  
      // GET LATEST RECORD
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', currentUser.id)
        .is('clock_out', null)
        .order('id', { ascending: false })
        .limit(1)
  
      if (error || data.length === 0) {
        setStatus('⚠️ Clock IN first')
        return
      }
  
      const record = data[0]
  
      // 🔥 EXTRA SAFETY CHECK (VERY IMPORTANT FOR FYP)
      if (record.clock_out) {
        setStatus('⚠️ Already clocked out')
        return
      }
  
      // UPDATE CLOCK OUT
      const { error: updateError } = await supabase
        .from('attendance')
        .update({
          clock_out: new Date().toISOString()
        })
        .eq('id', record.id)
  
      if (updateError) {
        console.log(updateError)
        setStatus('❌ Failed to clock out')
        return
      }
  
      setStatus('✅ Clocked OUT successfully')
      fetchHistory()
  
    } finally {
      // 🔓 ALWAYS UNLOCK (IMPORTANT)
      setIsClockingOut(false)
    }
  }

  //////////////////////////////////////////////////
  // LOGOUT
  //////////////////////////////////////////////////

  function logout() {

    localStorage.removeItem('currentUser')

    window.location.href = '/login'
  }

  return (

    <div className="min-h-screen flex bg-[#eaf1f8]">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#3b5b8a] text-white min-h-screen">

        {/* LOGO */}
        <div className="p-6 border-b border-white/20">

          <img
            src="/logo.png"
            alt="logo"
            className="w-36 bg-white p-2 rounded-md"
          />

        </div>

        {/* MENU */}
        <div className="flex flex-col mt-4">

          <Link
            href="/clockin-out"
            className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold"
          >
            Clock In / Out
          </Link>

          <Link
            href="/view-payslip"
            className="px-6 py-4 hover:bg-white/10 transition"
          >
            View Payslip
          </Link>

          <Link
  href="/apply-leave"
  className="px-6 py-4 hover:bg-white/10 transition"
>
  Apply Leave
</Link>

          <button
            onClick={logout}
            className="px-6 py-4 text-left hover:bg-white/10 transition"
          >
            Logout
          </button>

        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">
       {/* TOPBAR */}
<div className="flex justify-between items-center border-b pb-5 mb-8">

<div>

  <h2 className="text-3xl font-bold text-[#3b5b8a]">
    Hello {currentUser?.name} 👋
  </h2>

  <p className="text-gray-500 mt-1">
    Home &gt; Employee &gt; Clock In/Out
  </p>

</div>

<div className="flex items-center gap-4">

  <input
    placeholder="Search here..."
    className="
      w-64
      h-10
      px-4
      rounded-lg
      border
      bg-white
    "
  />

  <div className="text-sm text-gray-600">
    Employee ● online
  </div>

</div>

</div>

        
        {/* CLOCK CARD */}
        <Card className="rounded-3xl border-0 shadow-xl bg-white max-w-3xl mx-auto">

          <CardContent className="p-10">

            <div className="text-center">

              {/* TIME */}
              <h1 className="text-6xl font-bold text-[#3b5b8a]">

                {time}

              </h1>

              {/* DATE */}
              <p className="text-gray-500 mt-4 text-lg">

                {date}

              </p>

              {/* BUTTONS */}
              <div className="flex justify-center gap-6 mt-10">

                <Button
                  onClick={clockIn}
                  disabled={status.includes('Clocked IN') || status.includes('already')}
                  className="
                    h-24
                    w-32
                    text-xl
                    bg-[#3b5b8a]
                    hover:bg-[#2f4c75]
                  "
                >
                  IN
                </Button>

                <Button
                  onClick={clockOut}
                  className="
                    h-24
                    w-32
                    text-xl
                    bg-gray-600
                    hover:bg-gray-700
                  "
                >
                  OUT
                </Button>

              </div>

              {/* STATUS */}
              {status && (

                <p className="mt-8 text-lg font-medium">

                  {status}

                </p>

              )}

            </div>

          </CardContent>

        </Card>

        {/* HISTORY */}
        <Card className="rounded-3xl border-0 shadow-xl bg-white mt-10">

          <CardContent className="p-8">

            <h2 className="text-2xl font-bold text-[#3b5b8a] mb-6">

              Attendance History

            </h2>

            {history.length === 0 ? (

              <p className="text-gray-500">

                No attendance records yet.

              </p>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b text-left">

                      <th className="pb-4">
                        Clock In
                      </th>

                      <th className="pb-4">
                        Clock Out
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {history.map((record) => (

                      <tr
                        key={record.id}
                        className="border-b"
                      >

<td className="py-4">
{record.clock_in
  ? new Intl.DateTimeFormat('en-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date(record.clock_in))
  : '-'}
</td>

<td className="py-4">
{record.clock_out
  ? new Intl.DateTimeFormat('en-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date(record.clock_out))
  : '-'}
   
</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </CardContent>

        </Card>

      </div>

    </div>
  )
}