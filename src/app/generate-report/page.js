'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function GenerateReportPage() {

  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('')

  const [month, setMonth] = useState('May')
  const [year, setYear] = useState('2026')

  const [message, setMessage] = useState('')

  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [daysWorked, setDaysWorked] = useState(0)

  useEffect(() => {
    fetchEmployees()
  }, [])
  
  async function fetchEmployees() {

    const { data, error } = await supabase
      .from('employees')
      .select('*')
  
    if (error) {
  
      console.log(error)
  
    } else {
  
      const filtered = data.filter(
        emp => emp.role?.toLowerCase() !== 'admin'
      )
  
      setEmployees(filtered)
  
    }
  }
  function handleEmployee(id) {

    setSelectedEmployee(id)

    const emp = employees.find(
      e => String(e.id) === String(id)
    )

    if (emp) {
      setSelectedEmployeeName(emp.name)
    }
  }

  async function generateReport() {

    if (!selectedEmployee) {

      setMessage('Please select an employee')
      return

    }

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', selectedEmployee)

    if (error) {

      console.log(error)
      setMessage('Failed to load attendance')

    } else {

      setAttendanceRecords(data)
      setDaysWorked(data.length)

      setMessage(
        `Found ${data.length} attendance record(s)`
      )

    }
  }

  function downloadPDF() {

    if (attendanceRecords.length === 0) {

      alert('No attendance records found')
      return

    }

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text('JED PUMP SDN BHD', 14, 20)

    doc.setFontSize(14)
    doc.text('Attendance Report', 14, 30)

    doc.setFontSize(11)
    doc.text(
      `Employee: ${selectedEmployeeName}`,
      14,
      40
    )

    doc.text(
        `Month: ${month} ${year}`,
        14,
        48
      )
  
      autoTable(doc, {
  
        startY: 55,
  
        head: [[
          'Date',
          'Clock In',
          'Clock Out',
          'Status'
        ]],
  
        body: attendanceRecords.map(record => [

          new Date(record.clock_in).toLocaleDateString(
            'en-MY',
            {
              timeZone: 'Asia/Kuala_Lumpur'
            }
          ),
        
          new Date(record.clock_in).toLocaleTimeString(
            'en-MY',
            {
              timeZone: 'Asia/Kuala_Lumpur'
            }
          ),
        
          record.clock_out
            ? new Date(record.clock_out).toLocaleTimeString(
                'en-MY',
                {
                  timeZone: 'Asia/Kuala_Lumpur'
                }
              )
            : '-',
        
          'Present'
        
        ])
  
      })
  
      doc.save(
        `${selectedEmployeeName}_${month}_${year}.pdf`
      )
  
    }
  
    return (
  
      <div className="min-h-screen flex bg-[#eaf1f8]">
  
        {/* Sidebar */}
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
  
            <Link
              href="/generate-report"
              className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold"
            >
              Generate Report
            </Link>

            <Link
  href="/leave-approval"
  className="px-6 py-4 hover:bg-white/10 transition"
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
  
        {/* Main */}

        
        <div className="flex-1 p-10">
          {/* TOPBAR */}
<div className="flex justify-between items-center border-b pb-5 mb-8">

<div>

  <h2 className="text-3xl font-bold text-[#3b5b8a]">
    Hello Admin 👋
  </h2>

  <p className="text-gray-500 mt-1">
  Home &gt; Admin &gt; Generate Report
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
  
          <h1 className="text-3xl font-bold text-[#3b5b8a] mb-8">
            Attendance Report
          </h1>
  
          <div className="bg-white p-8 rounded-3xl shadow-lg max-w-4xl">
  
          <label className="font-medium">
  Select Employee
</label>

<select
  value={selectedEmployee}
  onChange={(e) => handleEmployee(e.target.value)}
  className="w-full h-12 border rounded-lg px-3 mt-2 mb-6"
>
  <option value="">
    Select Employee
  </option>

  {employees.map((emp) => (
    <option
      key={emp.id}
      value={emp.id}
    >
      {emp.empid} - {emp.name}
    </option>
  ))}
</select>
  
            <label className="font-medium">
              Month
            </label>
  
            <select
              value={month}
              onChange={(e) =>
                setMonth(e.target.value)
              }
              className="w-full h-12 border rounded-lg px-3 mt-2 mb-6"
            >
  
              <option>January</option>
              <option>February</option>
              <option>March</option>
              <option>April</option>
              <option>May</option>
              <option>June</option>
              <option>July</option>
              <option>August</option>
              <option>September</option>
              <option>October</option>
              <option>November</option>
              <option>December</option>
  
            </select>
  
            <label className="font-medium">
              Year
            </label>
  
            <select
  value={year}
  onChange={(e) => setYear(e.target.value)}
  className="w-full h-12 border rounded-lg px-3"
>
  {Array.from({ length: 20 }, (_, i) => {
    const y = 2020 + i

    return (
      <option key={y} value={y}>
        {y}
      </option>
    )
  })}
</select>
  
            <button
              onClick={generateReport}
              className="
                w-full
                h-12
                bg-[#3b5b8a]
                text-white
                rounded-lg
                mt-8
              "
            >
              Generate Report
            </button>
  
            {message && (
  
              <p className="text-center mt-4">
  
                {message}
  
              </p>
  
            )}
  
            {attendanceRecords.length > 0 && (
  
              <div className="mt-8">
  
                <h2 className="text-2xl font-bold mb-4">
                  Attendance Report
                </h2>
  
                <p className="mb-4">
                  <strong>Total Days Worked:</strong> {daysWorked}
                </p>
  
                <table className="w-full border">
  
                  <thead>
  
                    <tr className="bg-gray-100">
  
                      <th className="border p-2">
                        Clock In
                      </th>
  
                      <th className="border p-2">
                        Clock Out
                      </th>
  
                    </tr>
  
                  </thead>
  
                  <tbody>
  
                    {attendanceRecords.map((record) => (
  
                      <tr key={record.id}>
  
  <td className="border p-2">
  {new Date(record.clock_in).toLocaleString(
    'en-MY',
    {
      timeZone: 'Asia/Kuala_Lumpur',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
  )}
</td>

<td className="border p-2">
  {record.clock_out
    ? new Date(record.clock_out).toLocaleString(
        'en-MY',
        {
          timeZone: 'Asia/Kuala_Lumpur',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }
      )
    : '-'}
</td>
  
                      </tr>
  
                    ))}
  
                  </tbody>
  
                </table>
  
                <button
                  onClick={downloadPDF}
                  className="
                    mt-6
                    bg-green-600
                    text-white
                    px-6
                    py-3
                    rounded-lg
                    hover:bg-green-700
                  "
                >
                  Download PDF
                </button>
  
              </div>
  
            )}
  
          </div>
  
        </div>
  
      </div>
  
    )
  
  }