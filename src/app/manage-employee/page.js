'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Card,
  CardContent
} from '@/components/ui/card'

export default function ManageEmployeePage() {

  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingEmployee, setEditingEmployee] = useState(null)

  const [editBasicSalary, setEditBasicSalary] = useState('')
const [editAllowance, setEditAllowance] = useState('')
const [editEpf, setEditEpf] = useState('')
const [editSocso, setEditSocso] = useState('')
const [editOtRate, setEditOtRate] = useState('')

  // LOAD EMPLOYEES
  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('id', { ascending: false })

    if (error) {

      console.log(error)

    } else {

      setEmployees(data)

    }

    setLoading(false)
  }

  // DELETE EMPLOYEE
  async function deleteEmployee(id) {

    const confirmDelete = confirm(
      'Delete this employee?'
    )
  
    if (!confirmDelete) return
  
    // Delete attendance records first
    const { error: attendanceError } = await supabase
      .from('attendance')
      .delete()
      .eq('employee_id', id)
  
    if (attendanceError) {
  
      alert(
        'Attendance Delete Error:\n\n' +
        JSON.stringify(attendanceError, null, 2)
      )
  
      return
    }
  
    // Then delete employee
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
  
    if (error) {
  
      alert(
        'Employee Delete Error:\n\n' +
        JSON.stringify(error, null, 2)
      )
  
    } else {
  
      fetchEmployees()
  
    }
  }

  function editEmployee(emp) {

    setEditingEmployee(emp)
  
    setEditBasicSalary(emp.basic_salary || '')
setEditAllowance(emp.allowance || '')
setEditEpf(emp.epf_percent || '')
setEditSocso(emp.socso_percent || '')
setEditOtRate(emp.ot_rate || '')
  }

  async function saveSalaryProfile() {

    const { error } = await supabase
      .from('employees')
      .update({
        basic_salary: editBasicSalary,
allowance: editAllowance,
epf_percent: editEpf,
socso_percent: editSocso,
ot_rate: editOtRate
      })
      .eq('id', editingEmployee.id)
  
    if (error) {
  
      alert('Failed to update salary profile')
  
    } else {
  
      alert('Salary profile updated')
  
      setEditingEmployee(null)
  
      fetchEmployees()
    }
  }

  // FILTER EMPLOYEES
  // HIDE ADMINS
  const filteredEmployees = employees.filter((emp) =>

    emp.role !== 'admin' && (

      emp.name?.toLowerCase().includes(search.toLowerCase()) ||

      emp.email?.toLowerCase().includes(search.toLowerCase()) ||

      emp.empid?.toLowerCase().includes(search.toLowerCase())

    )

  )

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
            href="/admin"
            className="px-6 py-4 hover:bg-white/10 transition"
          >
            Dashboard
          </Link>

          <Link
            href="/manage-employee"
            className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold"
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

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* TOPBAR */}
        <div className="flex justify-between items-center border-b pb-5 mb-8">

          <div>

            <h2 className="text-3xl font-bold text-[#3b5b8a]">
              Hello Admin 👋
            </h2>

            <p className="text-gray-500 mt-1">
            Home &gt; Admin &gt; Manage Employee
            </p>

          </div>

          <div className="flex items-center gap-4">

            <Input
              placeholder="Search here..."
              className="w-64 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="text-sm text-gray-600">
              Admin ● online
            </div>

          </div>

        </div>

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between mb-6">

          <div>

            <h1 className="text-4xl font-bold text-[#3b5b8a]">
              Manage Employees
            </h1>

            <p className="text-gray-500 mt-2">
              View and manage employee records
            </p>

          </div>

          <Link href="/add-employee">

            <Button className="bg-[#2ecc71] hover:bg-[#27ae60]">

              + Add Employee

            </Button>

          </Link>

        </div>

        {/* TABLE CARD */}
        <Card className="rounded-3xl border-0 shadow-xl bg-white">

          <CardContent className="p-8">

            {loading ? (

              <p className="text-gray-500">
                Loading employees...
              </p>

            ) : filteredEmployees.length === 0 ? (

              <p className="text-gray-500">
                No employees found.
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
                        Name
                      </th>

                      <th className="pb-4 font-semibold text-gray-700">
                        Email
                      </th>

                      <th className="pb-4 font-semibold text-gray-700">
                        IC / Passport
                      </th>

                      <th className="pb-4 font-semibold text-gray-700">
  Basic Salary
</th>

<th className="pb-4 font-semibold text-gray-700">
  Allowance
</th>

<th className="pb-4 font-semibold text-gray-700">
  EPF %
</th>

<th className="pb-4 font-semibold text-gray-700">
  SOCSO %
</th>

<th className="pb-4 font-semibold text-gray-700">
  OT Rate
</th>

                      <th className="pb-4 font-semibold text-gray-700">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredEmployees.map((emp) => (

                      <tr
                        key={emp.id}
                        className="border-b hover:bg-gray-50 transition"
                      >

                        <td className="py-4">
                          {emp.empid}
                        </td>

                        <td className="py-4 font-medium">
                          {emp.name}
                        </td>

                        <td className="py-4">
                          {emp.email}
                        </td>

                        <td className="py-4">
                          {emp.ic}
                        </td>
                        <td className="py-4">
  RM {emp.basic_salary}
</td>

<td className="py-4">
  RM {emp.allowance}
</td>

<td className="py-4">
  {emp.epf_percent}%
</td>

<td className="py-4">
  {emp.socso_percent}%
</td>

<td className="py-4">
  RM {emp.ot_rate}
</td>
                       

                        <td className="py-4">

                        <div className="flex gap-2">

<Button
  size="sm"
  className="bg-blue-500 hover:bg-blue-600"
  onClick={() => editEmployee(emp)}
>
  Edit Salary
</Button>

<Button
  size="sm"
  onClick={() => deleteEmployee(emp.id)}
  className="bg-red-500 hover:bg-red-600"
>
  Delete
</Button>

</div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </CardContent>

        </Card>
        {editingEmployee && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <div className="bg-white p-8 rounded-3xl w-[700px] shadow-2xl">

    <h2 className="text-3xl font-bold mb-8">
      Edit Salary Profile
    </h2>

    <div className="space-y-4">

      <div>
        <label className="block mb-2 font-medium">
          Basic Salary (RM)
        </label>
        <Input
          value={editBasicSalary}
          onChange={(e) =>
            setEditBasicSalary(e.target.value)
          }
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Allowance (RM)
        </label>
        <Input
          value={editAllowance}
          onChange={(e) =>
            setEditAllowance(e.target.value)
          }
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          EPF Percentage (%)
        </label>
        <Input
          value={editEpf}
          onChange={(e) =>
            setEditEpf(e.target.value)
          }
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          SOCSO Percentage (%)
        </label>
        <Input
          value={editSocso}
          onChange={(e) =>
            setEditSocso(e.target.value)
          }
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          OT Rate (RM / Hour)
        </label>
        <Input
          value={editOtRate}
          onChange={(e) =>
            setEditOtRate(e.target.value)
          }
        />
      </div>

    </div>

    <div className="flex gap-4 mt-8">

    <Button
  onClick={saveSalaryProfile}
  className="bg-green-600 hover:bg-green-700"
>
  Save
</Button>

      <Button
        variant="outline"
        onClick={() => setEditingEmployee(null)}
      >
        Cancel
      </Button>

    </div>

  </div>

</div>

)}

    </div>
    </div>

)
}

  
