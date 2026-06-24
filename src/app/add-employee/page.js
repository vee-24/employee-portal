'use client'

import { useState } from 'react'
import Link from 'next/link'

import { supabase } from '@/lib/supabase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function AddEmployeePage() {

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [empid, setEmpid] = useState('')
  const [ic, setIc] = useState('')
  
  const [basicSalary, setBasicSalary] = useState('')
  const [allowance, setAllowance] = useState('')
  const [epfPercent, setEpfPercent] = useState('')
  const [socsoPercent, setSocsoPercent] = useState('')
  const [otRate, setOtRate] = useState('')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function addEmployee() {

    if (
      !name ||
      !email ||
      !password ||
      !empid ||
      !ic ||
      !basicSalary ||
      !allowance ||
      !epfPercent ||
      !socsoPercent ||
      !otRate
    ) {

      setMessage('⚠️ Please fill all fields')
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('employees')
      .insert([
        {
          name,
          email,
          password,
          empid,
          ic,
          
        
          basic_salary: basicSalary,
          allowance: allowance,
          epf_percent: epfPercent,
          socso_percent: socsoPercent,
          ot_rate: otRate
        }
      ])

    setLoading(false)

    if (error) {

      console.log('SUPABASE ERROR:', error)
alert(JSON.stringify(error))
      setMessage('❌ Failed to add employee')

    } else {

      setMessage('✅ Employee added successfully')

      setName('')
      setEmail('')
      setPassword('')
      setEmpid('')
      setIc('')
    
      setBasicSalary('')
setAllowance('')
setEpfPercent('')
setSocsoPercent('')
setOtRate('')
    }
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
            href="/admin"
            className="px-6 py-4 hover:bg-white/10 transition cursor-pointer"
          >
            Dashboard
          </Link>

          <Link
            href="/manage-employee"
            className="px-6 py-4 hover:bg-white/10 transition cursor-pointer"
          >
            Manage Employee
          </Link>

          <Link
            href="/add-employee"
            className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold cursor-pointer"
          >
            Add Employee
          </Link>

          <Link
            href="/generate-report"
            className="px-6 py-4 hover:bg-white/10 transition cursor-pointer"
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
            className="px-6 py-4 hover:bg-white/10 transition cursor-pointer"
          >
            Process Payroll
          </Link>

        

          <Link
            href="/login"
            className="px-6 py-4 hover:bg-white/10 transition cursor-pointer"
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
              Home &gt; Admin &gt; Add Employee
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

        {/* PAGE TITLE */}
        <div className="mb-6">

          <h1 className="text-4xl font-bold text-[#3b5b8a]">
            Add Employee
          </h1>

          <p className="text-gray-500 mt-2">
            Create a new employee account
          </p>

        </div>

        {/* CARD */}
        <Card className="w-full max-w-2xl rounded-3xl border-0 shadow-xl bg-white">

          <CardContent className="p-10">

            <div className="space-y-6">

              {/* FULL NAME */}
              <div className="space-y-2">

                <Label className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>

                <Input
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />

              </div>

              {/* EMAIL */}
              <div className="space-y-2">

                <Label className="text-sm font-medium text-gray-700">
                  Email
                </Label>

                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />

              </div>

              {/* PASSWORD */}
              <div className="space-y-2">

                <Label className="text-sm font-medium text-gray-700">
                  Password
                </Label>

                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />

              </div>

              {/* EMPLOYEE ID */}
              <div className="space-y-2">

                <Label className="text-sm font-medium text-gray-700">
                  Employee ID
                </Label>

                <Input
                  placeholder="EMP-001"
                  value={empid}
                  onChange={(e) => setEmpid(e.target.value)}
                  className="h-12"
                />

              </div>

              {/* IC / PASSPORT */}
              <div className="space-y-2">

                <Label className="text-sm font-medium text-gray-700">
                  IC / Passport
                </Label>

                <Input
                  placeholder="Enter IC / Passport"
                  value={ic}
                  onChange={(e) => setIc(e.target.value)}
                  className="h-12"
                />

              </div>

              <div className="space-y-2">

  <Label>
    Basic Salary (RM)
  </Label>

  <Input
    type="number"
    placeholder="3000"
    value={basicSalary}
    onChange={(e) => setBasicSalary(e.target.value)}
  />

</div>
<div className="space-y-2">

  <Label>
    Allowance (RM)
  </Label>

  <Input
    type="number"
    placeholder="500"
    value={allowance}
    onChange={(e) => setAllowance(e.target.value)}
  />

</div>
<div className="space-y-2">

  <Label>
    EPF Percentage
  </Label>

  <Input
    type="number"
    placeholder="11"
    value={epfPercent}
    onChange={(e) => setEpfPercent(e.target.value)}
  />

</div>

<div className="space-y-2">

  <Label>
    SOCSO Percentage
  </Label>

  <Input
    type="number"
    placeholder="0.5"
    value={socsoPercent}
    onChange={(e) => setSocsoPercent(e.target.value)}
  />

</div>
<div className="space-y-2">

  <Label>
    OT Rate (RM / Hour)
  </Label>

  <Input
    type="number"
    placeholder="15"
    value={otRate}
    onChange={(e) => setOtRate(e.target.value)}
  />

</div>

            

              {/* BUTTON */}
              <Button
                onClick={addEmployee}
                disabled={loading}
                className="
                  w-full
                  h-12
                  text-base
                  bg-[#3b5b8a]
                  hover:bg-[#2f4c75]
                "
              >

                {loading ? 'Adding Employee...' : 'Add Employee'}

              </Button>

              {/* MESSAGE */}
              {message && (

                <p className="text-center text-sm font-medium">
                  {message}
                </p>

              )}

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  )
}