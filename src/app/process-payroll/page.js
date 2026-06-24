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

  useEffect(() => {
    loadEmployees()
  }, [])

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
  function handleEmployee(id) {

    setSelectedEmployee(id)

    const emp = employees.find(
      e => String(e.id) === String(id)
    )

    if (emp) {

      setEmployeeName(emp.name)
      setEmployeeId(emp.empid)
    
      setSalary(emp.basic_salary || 0)
      setAllowance(emp.allowance || 0)
    
      setEpfPercent(emp.epf_percent || 0)
      setSocsoPercent(emp.socso_percent || 0)
    
      setOtRate(emp.ot_rate || 0)
    
    }
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

  async function generatePayslip() {

    if (
      !selectedEmployee ||
      !salary
    ) {
      setMessage('Please complete all fields')
      return
    }

    const { error } = await supabase
  .from('payslips')
  .insert([
    {
      employee_id: employeeId,
      employee_name: employeeName,
    
      month: `${month} ${year}`,
    
      salary: Number(salary),
      allowance: Number(allowance),
    
      epf_percent: Number(epfPercent),
      socso_percent: Number(socsoPercent),
    
      ot_rate: Number(otRate),
      ot_hours: Number(otHours),
    
      net_salary: Number(netSalary.toFixed(2))
    }
    ])

      if (error) {

        console.log(error)
      
        setMessage(
          `❌ Failed: ${error.message}`
        )
      
      } else {
      
        setMessage(
          '✅ Payslip Generated Successfully'
        )
      
        setSelectedEmployee('')
        setEmployeeName('')
        setEmployeeId('')
      
        setSalary('')
        setAllowance('0')
       
      
      }
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
            onChange={(e) =>
              handleEmployee(e.target.value)
            }
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

  <label>OT Hours</label>

  <input
    type="number"
    value={otHours}
    onChange={(e) =>
      setOtHours(e.target.value)
    }
    className="w-full h-12 border rounded-lg px-3 mt-2"
  />

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
    OT Hours: {otHours}
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

              RM {netSalary}

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