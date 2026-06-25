'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { supabase } from '@/lib/supabase'

import {
  Card,
  CardContent
} from '@/components/ui/card'

export default function ApplyLeavePage() {

  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')

  const [currentUser, setCurrentUser] = useState(null)
  const [myLeaves, setMyLeaves] = useState([])


useEffect(() => {
  const user = JSON.parse(
    localStorage.getItem('currentUser')
  )

  setCurrentUser(user)
}, [])

useEffect(() => {
  if (currentUser) {
    fetchMyLeaves()
  }
}, [currentUser])

async function fetchMyLeaves() {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', currentUser.empid || currentUser.id)
    .order('id', { ascending: false })

  if (!error) {
    setMyLeaves(data)
  }
}

  async function submitLeave() {
    console.log("CURRENT USER:", currentUser)

    const user = currentUser
  
    if (!user) {
      setMessage('❌ User not loaded')
      return
    }
  
    if (!leaveType || !startDate || !endDate || !reason) {
      setMessage('❌ Please fill in all fields')
      return
    }

    const { error } = await supabase
  .from('leave_requests')
  .insert([
    {
      employee_id: currentUser.empid || currentUser.id,
      employee_name: currentUser.name || 'Employee',
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason,
      status: 'Pending',
      created_at: new Date().toISOString()
    }
  ])

    if (error) {

      console.log(error)

      setMessage('❌ Failed to submit leave request')

    } else {

      setMessage('✅ Leave request submitted successfully')
    
      setLeaveType('')
      setStartDate('')
      setEndDate('')
      setReason('')
    
      // 🔥 HIGH MARKS: redirect after 1 second
      setTimeout(() => {
        window.location.href = '/apply-leave'
      }, 1000)
    }
  }

  function logout() {

    localStorage.removeItem('currentUser')
    window.location.href = '/login'
  }

  return (

    <div className="min-h-screen flex bg-[#eaf1f8]">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#3b5b8a] text-white min-h-screen">

        <div className="p-6 border-b border-white/20">

          <img
            src="/logo.png"
            alt="logo"
            className="w-36 bg-white p-2 rounded-md"
          />

        </div>

        <div className="flex flex-col mt-4">

          <Link
            href="/clockin-out"
            className="px-6 py-4 hover:bg-white/10 transition"
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
            className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold"
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
    Hello {currentUser?.name || 'Employee'} 👋
  </h2>

  <p className="text-gray-500 mt-1">
  Home &gt; Employee &gt; Apply Leave
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

        {/* HEADER */}
        <div className="border-b pb-5 mb-10">

          <h2 className="text-3xl font-bold text-[#3b5b8a]">

            Apply Leave

          </h2>

          <p className="text-gray-500 mt-1">

            Submit your leave application

          </p>

        </div>

        {/* FORM CARD */}
        <Card className="rounded-3xl border-0 shadow-xl bg-white max-w-4xl mx-auto">

          <CardContent className="p-8">

            <div className="space-y-5">

              <select
                value={leaveType}
                onChange={(e) =>
                  setLeaveType(e.target.value)
                }
                className="
                  w-full
                  border
                  rounded-xl
                  p-4
                "
              >
                <option value="">
                  Select Leave Type
                </option>

                <option>
                  Annual Leave
                </option>

                <option>
                  Medical Leave
                </option>

                <option>
                  Emergency Leave
                </option>

                <option>
                  Unpaid Leave
                </option>

                <option>
                  Maternity Leave
                </option>

              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className="
                  w-full
                  border
                  rounded-xl
                  p-4
                "
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                className="
                  w-full
                  border
                  rounded-xl
                  p-4
                "
              />

              <textarea
                rows="5"
                placeholder="Reason for leave..."
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                className="
                  w-full
                  border
                  rounded-xl
                  p-4
                "
              />

              <button
                onClick={submitLeave}
                className="
                  bg-[#3b5b8a]
                  hover:bg-[#2f4c75]
                  text-white
                  px-8
                  py-4
                  rounded-xl
                  font-medium
                "
              >
                Submit Leave Request
              </button>

              {message && (

                <div className="pt-3">

                  <p className="font-medium">

                    {message}

                  </p>

                </div>

              )}

            </div>

          </CardContent>

        </Card>
        {/* MY LEAVE HISTORY */}
<div className="mt-10">
  <h2 className="text-xl font-bold text-[#3b5b8a]">
    My Leave Requests
  </h2>

  {myLeaves.length === 0 ? (
    <p className="text-gray-500 mt-2">No leave requests yet.</p>
  ) : (
    myLeaves.map((leave) => (
      <div key={leave.id} className="mt-3 p-4 border rounded-lg bg-white">
        <p><b>{leave.leave_type}</b></p>
        <p>{leave.start_date} → {leave.end_date}</p>

        <p>
          Status:
          <span className={
            leave.status === 'Approved'
              ? 'text-green-600 font-bold ml-2'
              : leave.status === 'Rejected'
              ? 'text-red-600 font-bold ml-2'
              : 'text-orange-500 font-bold ml-2'
          }>
            {leave.status}
          </span>
        </p>
      </div>
    ))
  )}
</div>

      </div>

    </div>
  )
}