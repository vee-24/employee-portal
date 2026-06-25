'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { supabase } from '@/lib/supabase'

import {
  Card,
  CardContent
} from '@/components/ui/card'

import { Input } from '@/components/ui/input'

export default function AdminDashboard() {

  const [employeeCount, setEmployeeCount] = useState(0)
  const [adminCount, setAdminCount] = useState(0)
  const [attendanceToday, setAttendanceToday] = useState(0)
  const [attendanceCount, setAttendanceCount] = useState(0)

  const [recentEmployees, setRecentEmployees] = useState([])
  const [recentAttendance, setRecentAttendance] = useState([])

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    let employeeMap = {}

    //////////////////////////////////////////
    // EMPLOYEES
    //////////////////////////////////////////

    const { data: employees } = await supabase
      .from('employees')
      .select('*')

    if (employees) {

      const onlyEmployees = employees.filter(
        (emp) => emp.role !== 'admin'
      )

      const onlyAdmins = employees.filter(
        (emp) => emp.role === 'admin'
      )

      setEmployeeCount(onlyEmployees.length)

      setAdminCount(onlyAdmins.length)

      setRecentEmployees(
        onlyEmployees.slice(0, 5)
      )
      
      employees.forEach((emp) => {
        employeeMap[emp.id] = emp
      })
    }

    //////////////////////////////////////////
    // ATTENDANCE
    //////////////////////////////////////////

    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .order('clock_in', { ascending: false })

    if (attendance) {

      setAttendanceCount(attendance.length)

      const attendanceWithEmployee = attendance.map((att) => ({
        ...att,
        employeeCode: employeeMap[att.employee_id]?.empid || att.employee_id,
        employeeName: employeeMap[att.employee_id]?.name || ''
      }))
      
      setRecentAttendance(
        attendanceWithEmployee.slice(0, 5)
      )

      ////////////////////////////////////////
      // TODAY ATTENDANCE
      ////////////////////////////////////////

      const today = new Date()
      .toLocaleDateString('en-CA') 

      const todayRecords = attendance.filter((a) => {

        if (!a.clock_in) return false

        return a.clock_in &&
      new Date(a.clock_in).toLocaleDateString('en-CA') === today
      })

      setAttendanceToday(todayRecords.length)
    }
  }

  
  
  
  function getAttendanceStatus(clockIn) {
    if (!clockIn) return '-'
  
    const date = new Date(clockIn)
    if (isNaN(date.getTime())) return '-'
  
    const hours = date.getHours()
    const minutes = date.getMinutes()
  
    const cutoffHour = 9
  
    if (hours > cutoffHour || (hours === cutoffHour && minutes > 0)) {
      return 'Late'
    }
  
    return 'On Time'
  }
  
  async function getTodayAttendance(employee_id) {
    const today = new Date().toLocaleDateString('en-CA')
  
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employee_id)
  
    if (!data) return null
  
    return data.find((a) =>
      a.clock_in &&
      new Date(a.clock_in).toLocaleDateString('en-CA') === today
    )
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
            href="/admin"
            className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold"
          >
            Dashboard
          </Link>

          <Link
            href="/manage-employee"
            className="px-6 py-4 hover:bg-white/10 transition"
          >
            Manage Employee
          </Link>

          <Link
            href="/add-employee"
            className="px-6 py-4 hover:bg-white/10 transition"
          >
            Add Employee
          </Link>

          <Link
            href="/generate-report"
            className="px-6 py-4 hover:bg-white/10 transition"
          >
            Generate Report
          </Link>

          <Link
  href="/leave-approval"
  className="px-6 py-4 hover:bg-white/10 transition"
>
  Leave Approval
</Link>

          <Link
            href="/process-payroll"
            className="px-6 py-4 hover:bg-white/10 transition"
          >
            Process Payroll
          </Link>

          

          

          <Link
            href="/login"
            className="px-6 py-4 hover:bg-white/10 transition"
          >
            Logout
          </Link>

        </div>

      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">

        {/* TOPBAR */}
        <div className="flex justify-between items-center border-b pb-5 mb-8">

          <div>

            <h2 className="text-3xl font-bold text-[#3b5b8a]">
              Hello Admin 👋
            </h2>

            <p className="text-gray-500 mt-1">
              Home &gt; Dashboard
            </p>

          </div>

          <div className="flex items-center gap-4">

            <Input
              placeholder="Search here..."
              className="w-64 bg-white"
            />

            <div className="text-sm text-gray-600">
              Admin ● online
            </div>

          </div>

        </div>

        {/* TITLE */}
        <div className="mb-8">

          <h1 className="text-4xl font-bold text-[#3b5b8a]">
            Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Welcome to Smart Employee Portal
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          <Card className="rounded-3xl border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <p className="text-gray-500 mb-2">
                Total Employees
              </p>

              <h2 className="text-4xl font-bold text-[#3b5b8a]">
                {employeeCount}
              </h2>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <p className="text-gray-500 mb-2">
                Total Admins
              </p>

              <h2 className="text-4xl font-bold text-[#3b5b8a]">
                {adminCount}
              </h2>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <p className="text-gray-500 mb-2">
                Attendance Today
              </p>

              <h2 className="text-4xl font-bold text-[#3b5b8a]">
                {attendanceToday}
              </h2>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <p className="text-gray-500 mb-2">
                Total Attendance Records
              </p>

              <h2 className="text-4xl font-bold text-[#3b5b8a]">
                {attendanceCount}
              </h2>
            </CardContent>
          </Card>

        </div>

        {/* RECENT ATTENDANCE */}
        <Card className="rounded-3xl border-0 shadow-xl bg-white">

          <CardContent className="p-8">

            <h2 className="text-2xl font-bold text-[#3b5b8a] mb-6">

              Recent Attendance

            </h2>

            {recentAttendance.length === 0 ? (

              <p className="text-gray-500">
                No attendance records found.
              </p>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b text-left">

                      <th className="pb-4 font-semibold text-gray-700">
                        Employee ID
                      </th>

                      <th className="pb-4 font-semibold text-gray-700">
                        Clock In
                      </th>

                      <th className="pb-4 font-semibold text-gray-700">
                        Clock Out
                      </th>
                      <th className="pb-4 font-semibold text-gray-700">
                      Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {recentAttendance.map((att) => (

                      <tr
                        key={att.id}
                        className="border-b hover:bg-gray-50 transition"
                      >

<td className="py-4">
  {att.employeeCode}
  {att.employeeName ? ` - ${att.employeeName}` : ''}
</td>

                        <td className="py-4">
                        {att.clock_in
  ? new Date(att.clock_in).toLocaleString()
  : '-'}
                        </td>

                        <td className="py-4">
                        {att.clock_out
  ? new Date(att.clock_out).toLocaleString()
  : '-'}
                        </td>
                        <td className="py-4">
  <span
    className={
      getAttendanceStatus(att.clock_in) === 'Late'
        ? 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs'
        : 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs'
    }
  >
    {getAttendanceStatus(att.clock_in)}
  </span>
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