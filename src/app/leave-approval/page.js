'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LeaveApprovalPage() {

  const [leaveRequests, setLeaveRequests] = useState([])
  const [message, setMessage] = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const [popup, setPopup] = useState(null)

  useEffect(() => {

    fetchLeaveRequests()
  
    const channel = supabase
      .channel('leave_requests_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_requests'
        },
        (payload) => {

          fetchLeaveRequests()
        
          const newLeave = payload.new
        
          // ONLY SHOW POPUP WHEN NEW REQUEST IS INSERTED
          if (payload.eventType === 'INSERT') {
        
            setPopup({
              name: newLeave.employee_name,
              type: newLeave.leave_type
            })
        
            // auto close popup after 3 sec
            setTimeout(() => {
              setPopup(null)
            }, 3000)
          }
        
          setMessage('🔔 New leave request received')
        }
      )
      .subscribe()
  
    return () => {
      supabase.removeChannel(channel)
    }
  
  }, [])

  async function fetchLeaveRequests() {

    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('id', { ascending: false })

    if (error) {

      console.log(error)

    } else {

      setLeaveRequests(data || [])

const pending = (data || []).filter(
  (l) => l.status === 'Pending'
)

setPendingCount(pending.length)
    }
  }

  async function approveLeave(id) {

    const { error } = await supabase
      .from('leave_requests')
      .update({
        status: 'Approved'
      })
      .eq('id', id)

    if (error) {

      setMessage('❌ Failed to approve leave')

    } else {

      setMessage('✅ Leave approved')

      await fetchLeaveRequests()
    }
  }

  async function rejectLeave(id) {

    const { error } = await supabase
      .from('leave_requests')
      .update({
        status: 'Rejected'
      })
      .eq('id', id)

    if (error) {

      setMessage('❌ Failed to reject leave')

    } else {

      setMessage('✅ Leave rejected')

      await fetchLeaveRequests()
    }
  }

  return (

    <div className="min-h-screen flex bg-[#eaf1f8]">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#3b5b8a] text-white min-h-screen">

        <div className="p-6 border-b border-white/20">

          <img
            src="/logo.png"
            alt="logo"
            className="w-36 bg-white rounded-md p-2"
          />

        </div>

        <div className="flex flex-col mt-4">

          <Link href="/admin" className="px-6 py-4">
            Dashboard
          </Link>

          <Link href="/manage-employee" className="px-6 py-4">
            Manage Employee
          </Link>

          <Link href="/add-employee" className="px-6 py-4">
            Add Employee
          </Link>

          <Link href="/generate-report" className="px-6 py-4">
            Generate Report
          </Link>

          <Link
            href="/leave-approval"
            className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold"
          >
            Leave Approval
          </Link>

          <Link href="/process-payroll" className="px-6 py-4">
            Process Payroll
          </Link>


          <Link href="/login" className="px-6 py-4">
            Logout
          </Link>

        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">
      {popup && (
  <div className="fixed top-6 right-6 bg-white shadow-xl border-l-4 border-[#3b5b8a] p-4 rounded-xl z-50 transition-all duration-300-bounce">
    <p className="font-bold text-[#3b5b8a]">
      🔔 New Leave Request
    </p>

    <p className="text-sm text-gray-600">
      {popup.name} applied for {popup.type}
    </p>
  </div>
)}
        {/* TOPBAR */}
<div className="flex justify-between items-center border-b pb-5 mb-8">

<div>

  <h2 className="text-3xl font-bold text-[#3b5b8a]">
    Hello Admin 👋
  </h2>

  <p className="text-gray-500 mt-1">
  Home &gt; Admin &gt; Leave Approval
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
    Admin ● online
  </div>

</div>

</div>

<h1 className="text-3xl font-bold text-[#3b5b8a]">
  Leave Approval{" "}
  <span className="text-orange-500">
    ({pendingCount})
  </span>
</h1>

        <div className="bg-white rounded-3xl shadow-lg p-8">

          {message && (

            <p className="mb-6 font-medium">
              {message}
            </p>

          )}

          {leaveRequests.length === 0 ? (

            <p>No leave requests found.</p>

          ) : (

            <table className="w-full border">

              <thead>

                <tr className="bg-gray-100">

                  <th className="border p-3">
                    Employee
                  </th>

                  <th className="border p-3">
                    Leave Type
                  </th>

                  <th className="border p-3">
                    Start Date
                  </th>

                  <th className="border p-3">
                    End Date
                  </th>

                  <th className="border p-3">
                    Reason
                  </th>

                  <th className="border p-3">
                    Status
                  </th>

                  <th className="border p-3">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {leaveRequests.map((leave) => (

                  <tr key={leave.id}>

                    <td className="border p-3">
                      {leave.employee_name}
                    </td>

                    <td className="border p-3">
                      {leave.leave_type}
                    </td>

                    <td className="border p-3">
                      {leave.start_date}
                    </td>

                    <td className="border p-3">
                      {leave.end_date}
                    </td>

                    <td className="border p-3">
                      {leave.reason}
                    </td>

                    <td className="border p-3">

                      <span
                        className={
                          leave.status === 'Approved'
                            ? 'text-green-600 font-bold'
                            : leave.status === 'Rejected'
                            ? 'text-red-600 font-bold'
                            : 'text-orange-500 font-bold'
                        }
                      >
                        {leave.status}
                      </span>

                    </td>

                    <td className="border p-3">

                      {leave.status === 'Pending' && (

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              approveLeave(leave.id)
                            }
                            className="
                              bg-green-600
                              text-white
                              px-3
                              py-2
                              rounded
                            "
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              rejectLeave(leave.id)
                            }
                            className="
                              bg-red-600
                              text-white
                              px-3
                              py-2
                              rounded
                            "
                          >
                            Reject
                          </button>

                        </div>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>
  )
}