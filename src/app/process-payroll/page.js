'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ProcessPayrollPage() {

  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')

  const [employeeName, setEmployeeName] = useState('')
  const [employeeId, setEmployeeId] = useState('')

  const [month, setMonth] = useState('January')
  const [year, setYear] = useState('2026')

  const [salary, setSalary] = useState(0)
const [allowance, setAllowance] = useState(0)

const [epfPercent, setEpfPercent] = useState(0)
const [socsoPercent, setSocsoPercent] = useState(0)
const [otRate, setOtRate] = useState(0)

const [otHours, setOtHours] = useState(0)

  const [message, setMessage] = useState('')
  const [payrollData, setPayrollData] = useState([])
  const [totalHoursWorked, setTotalHoursWorked] = useState(0)
const [calculatedOtHours, setCalculatedOtHours] = useState(0)

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    fetchPayslips()
  }, [])
  useEffect(() => {
    if (selectedEmployee) {
      updateHours(selectedEmployee)
    }
  }, [month, year])

  async function loadEmployees() {

    const { data, error } = await supabase
    .from('employees')
    .select('*')

  if (!error) {

    const filtered = data.filter(
      emp => emp.role?.toLowerCase() !== 'admin'
    )

    setEmployees(filtered)
  }
}
async function fetchPayslips() {
  const { data, error } = await supabase
    .from('payslips')
    .select('*')
    .order('id', { ascending: false })

  if (!error) {
    setPayrollData(data || [])
  }
}


async function handleEmployee(id) {
  setSelectedEmployee(id)

  const emp = employees.find(e => String(e.id) === String(id))
  if (!emp) {
    return
  }

  setEmployeeName(emp.name)
  setEmployeeId(emp.empid)
  setSalary(emp.basic_salary || 0)
  setAllowance(emp.allowance || 0)
  setEpfPercent(emp.epf_percent || 0)
  setSocsoPercent(emp.socso_percent || 0)
  setOtRate(emp.ot_rate || 0)

  // ✅ This is crucial
  const { totalHours, otHours } = await calculateHoursWorked(emp.id, month, year)
  setTotalHoursWorked(totalHours)
  setCalculatedOtHours(otHours)
  setOtHours(otHours)
}
  
  async function updateHours(empid) {
    const { totalHours, otHours } = await calculateHoursWorked(empid, month, year)
    setTotalHoursWorked(totalHours)
    setCalculatedOtHours(otHours)
    setOtHours(otHours) // keep payroll calculation consistent
  }

  const grossSalary =
  Number(salary) +
  Number(allowance) +
  (Number(otRate) * Number(otHours))

const epfDeduction =
  grossSalary * (Number(epfPercent) / 100)

const socsoDeduction =
  grossSalary * (Number(socsoPercent) / 100)

const netSalary =
  grossSalary -
  epfDeduction -
  socsoDeduction


  async function getAttendanceHours(empid, month, year) {

    const startDate = `${year}-${String(monthIndex(month)).padStart(2, '0')}-01`
    const endDate = `${year}-${String(monthIndex(month) + 1).padStart(2, '0')}-01`
  
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', empid)
      .gte('clock_in', startDate)
      .lt('clock_in', endDate)
  
    let totalHours = 0
    let otHours = 0
  
    data?.forEach(r => {
      if (r.clock_in && r.clock_out) {
        const hours =
          (new Date(r.clock_out) - new Date(r.clock_in)) /
          (1000 * 60 * 60)
  
        totalHours += hours
  
        if (hours > 8) {
          otHours += (hours - 8)
        }
      }
    })
  
    return { totalHours, otHours }
  }
  function monthIndex(month) {
    const months = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12
    }
  
    return months[month]
  }

  async function calculateHoursWorked(empid, month, year) {
    const startDate = `${year}-${String(monthIndex(month)).padStart(2, '0')}-01`
    const endDate = `${year}-${String(monthIndex(month) + 1).padStart(2, '0')}-01`
  
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', empid)
      .gte('clock_in', startDate)
      .lt('clock_in', endDate)
  
    let total = 0
    let ot = 0
  
    data?.forEach(r => {
      if (r.clock_in && r.clock_out) {
        const hours = (new Date(r.clock_out) - new Date(r.clock_in)) / (1000 * 60 * 60)
        total += hours
        if (hours > 8) ot += (hours - 8)
      }
    })
  
    // ✅ fixed decimals here
    return {
      totalHours: Number(total.toFixed(2)),
      otHours: Number(ot.toFixed(2))
    }
  }

  async function getLeaveDays(empid, month, year) {

    const startDate = `${year}-${String(monthIndex(month)).padStart(2, '0')}-01`
    const endDate = `${year}-${String(monthIndex(month) + 1).padStart(2, '0')}-01`
  
    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', empid)
      .eq('status', 'Approved')
      .gte('start_date', startDate)
      .lt('start_date', endDate)
  
    let totalDays = 0
  
    data?.forEach(l => {
      const start = new Date(l.start_date)
      const end = new Date(l.end_date)
  
      const diff =
        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  
      totalDays += diff
    })
  
    return totalDays
  }

  async function generatePayslip() {

    if (!selectedEmployee || !salary) {
      setMessage('Please complete all fields')
      return
    }
  
    // Get attendance and leave data
    const { totalHours, otHours } = await getAttendanceHours(selectedEmployee, month, year)
    const leaveDays = await getLeaveDays(employeeId, month, year)
  
    const basic = Number(salary)
    const allowanceVal = Number(allowance)
  
    // Round OT hours to 2 decimals
    const roundedOtHours = Number(otHours.toFixed(2))
    const roundedTotalHours = Number(totalHours.toFixed(2))
  
    // Calculate OT pay and gross salary, round to 2 decimals
    const otPay = Number((calculatedOtHours * Number(otRate || 0)).toFixed(2))
    const gross = Number((basic + allowanceVal + otPay).toFixed(2))
  
    // Leave deduction
    const dailyRate = basic / 30
    const leaveDeduction = Number((leaveDays * dailyRate).toFixed(2))
  
    // EPF and SOCSO
    const epf = Number((gross * (epfPercent / 100)).toFixed(2))
    const socso = Number((gross * (socsoPercent / 100)).toFixed(2))
  
    // Net salary
    const net = Number((gross - epf - socso - leaveDeduction).toFixed(2))
  
    // Save to database with rounded values
    const { error } = await supabase.from('payslips').insert([
      {
        employee_id: Number(selectedEmployee),
        employee_name: employeeName,
        month: `${month} ${year}`,
  
        salary: basic,
        allowance: allowanceVal,
  
        ot_hours: roundedOtHours,
        ot_rate: otRate,
  
        epf_percent: epfPercent,
        socso_percent: socsoPercent,
  
        leave_days: leaveDays,
        leave_deduction: leaveDeduction,
        total_hours: roundedTotalHours,
  
        net_salary: net
      }
    ])
  
    if (error) {
      console.log('PAYSLIP ERROR:', error)
      setMessage('❌ ' + error.message)
    } else {
      setMessage('✅ Payslip Generated Successfully')
      fetchPayslips()
    }
  }

  function exportExcel() {
    const data = payrollData.map(p => ({
      Employee: p.employee_name,
      Month: p.month,
      Salary: p.salary,
      Allowance: p.allowance,
      OT_Hours: p.ot_hours,
      Leave_Days: p.leave_days,
      Net_Salary: p.net_salary
    }))
  
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll")
  
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    })
  
    const file = new Blob([excelBuffer], {
      type: "application/octet-stream"
    })
  
    saveAs(file, `Payroll_${month}_${year}.xlsx`)
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

<Link
  href="/admin"
  className="px-6 py-4 hover:bg-white/10 transition"
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
  className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold"
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

      {/* Main */}

      <div className="flex-1 p-10">
        {/* TOPBAR */}
<div className="flex justify-between items-center border-b pb-5 mb-8">

<div>

  <h2 className="text-3xl font-bold text-[#3b5b8a]">
    Hello Admin 👋
  </h2>

  <p className="text-gray-500 mt-1">
  Home &gt; Admin &gt; Process Payroll
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
          Process Payroll
        </h1>

        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-3xl">

          <label className="font-medium">
            Select Employee
          </label>

          <select
             value={selectedEmployee}
  onChange={async (e) => await handleEmployee(e.target.value)}
  className="w-full h-12 border rounded-lg px-3 mt-2 mb-6"
          >

            <option value="">
              Select Employee
            </option>

            {employees.map(emp => (

              <option
                key={emp.id}
                value={emp.id}
              >
                {emp.empid} - {emp.name}
              </option>

            ))}

          </select>

          <p className="mb-2">
            <strong>Employee ID:</strong> {employeeId || '-'}
          </p>

          <p className="mb-6">
            <strong>Name:</strong> {employeeName || '-'}
          </p>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label>Month</label>

              <select
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value)
                }
                className="w-full h-12 border rounded-lg px-3 mt-2"
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

            </div>

            <div>

              <label>Year</label>

              <select
                value={year}
                onChange={(e) =>
                  setYear(e.target.value)
                }
                className="w-full h-12 border rounded-lg px-3 mt-2"
              >

                <option>2025</option>
                <option>2026</option>
                <option>2027</option>
                <option>2028</option>

              </select>

            </div>

          </div>

          <div className="mt-6">

            <label>Basic Salary</label>

            <input
              type="number"
              value={salary}
              onChange={(e) =>
                setSalary(e.target.value)
              }
              className="w-full h-12 border rounded-lg px-3 mt-2"
            />

          </div>

          <div className="mt-6">

            <label>Allowance</label>

            <input
              type="number"
              value={allowance}
              onChange={(e) =>
                setAllowance(e.target.value)
              }
              className="w-full h-12 border rounded-lg px-3 mt-2"
            />

          </div>

          <div className="mt-6">

  

</div>
<div className="mt-6 p-4 bg-blue-50 rounded-xl">

  <p className="font-bold text-[#3b5b8a]">
    Hours Worked 
  </p>

  <p>Total Hours: {totalHoursWorked.toFixed(2)} hrs</p>
<p>OT Hours: {calculatedOtHours.toFixed(2)} hrs</p>

</div>
<div className="mt-8 space-y-2">

  <p>
    Basic Salary: RM {salary}
  </p>

  <p>
    Allowance: RM {allowance}
  </p>

  <p>
    OT Rate: RM {otRate}/hour
  </p>

  <p>
    OT Hours: {otHours.toFixed(2)}
  </p>

  <p>
    EPF ({epfPercent}%):
    RM {epfDeduction.toFixed(2)}
  </p>

  <p>
    SOCSO ({socsoPercent}%):
    RM {socsoDeduction.toFixed(2)}
  </p>

</div>
<div className="bg-gray-50 rounded-xl p-4 mt-6">

  <p>
    Gross Salary:
    RM {grossSalary.toFixed(2)}
  </p>

  <p>
    EPF Deduction:
    RM {epfDeduction.toFixed(2)}
  </p>

  <p>
    SOCSO Deduction:
    RM {socsoDeduction.toFixed(2)}
  </p>

  <p>
    Total Deduction:
    RM {(epfDeduction + socsoDeduction).toFixed(2)}
  </p>

</div>
         
          <div className="bg-[#f5f7fb] rounded-2xl p-6 mt-8">

            <p>Net Salary</p>

            <h2 className="text-4xl font-bold text-[#3b5b8a]">

              RM {netSalary.toFixed(2)}

            </h2>

          </div>

          <button
            onClick={generatePayslip}
            className="
              w-full
              h-12
              bg-[#3b5b8a]
              text-white
              rounded-lg
              mt-8
            "
          >
            Generate Payslip
          </button>

          {message && (

            <p className="text-center mt-4">
              {message}
            </p>

          )}

        </div>

      </div>

    </div>
  )
}