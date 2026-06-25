'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'


export default function ViewPayslipPage() {

  const [payslips, setPayslips] = useState([])
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  const [selectedMonth, setSelectedMonth] = useState('all')

  // MODAL STATE
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState(null)

  //////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    if (user) {
      setEmployee(user)
      fetchPayslips(user.empid)
    }
  }, [])

  //////////////////////////////////////////////////
  // FETCH PAYSLIPS
  //////////////////////////////////////////////////
  async function fetchPayslips(empid) {
    const { data } = await supabase
      .from('payslips')
      .select('*')
      .eq('employee_id', empid)
      .order('id', { ascending: false })

    setPayslips(data || [])
    setLoading(false)
  }

  //////////////////////////////////////////////////
  // FILTER MONTH
  //////////////////////////////////////////////////
  const filteredPayslips = payslips.filter(p =>
    selectedMonth === 'all'
      ? true
      : p.month?.toLowerCase().includes(selectedMonth)
  )

  //////////////////////////////////////////////////
  // OPEN PREVIEW MODAL
  //////////////////////////////////////////////////
  const openPreview = (payslip) => {
    setSelectedPayslip(payslip)
    setPreviewOpen(true)
  }

  

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////
  return (
    <div className="min-h-screen flex bg-[#eaf1f8]">

      {/* SIDEBAR */}
      <div className="w-64 bg-[#3b5b8a] text-white min-h-screen">
        <div className="p-6 border-b border-white/20">
          <img src="/logo.png" className="w-36 bg-white p-2 rounded-md" />
        </div>

        <div className="flex flex-col mt-4">
          <Link href="/clockin-out" className="px-6 py-4 hover:bg-white/10">
            Clock In / Out
          </Link>

          <Link href="/view-payslip" className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold">
            View Payslip
          </Link>

          <Link href="/apply-leave" className="px-6 py-4 hover:bg-white/10">
            Apply Leave
          </Link>

          <Link href="/login" className="px-6 py-4 hover:bg-white/10">
      Logout
    </Link>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">

        {/* HEADER */}
        <h1 className="text-4xl font-bold text-[#3b5b8a] mb-4">
          My Payslips
        </h1>

        {/* FILTER */}
        <div className="mb-6">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border rounded-xl"
          >
            <option value="all">All Months</option>
            <option value="january">January</option>
            <option value="february">February</option>
            <option value="march">March</option>
            <option value="april">April</option>
            <option value="may">May</option>
            <option value="june">June</option>
            <option value="july">July</option>
          </select>
        </div>

        {/* LIST */}
        <div className="space-y-6">

          {filteredPayslips.map((p) => (

            <Card key={p.id} className="p-6">

              <div className="flex justify-between">

                <div>
                  <h2 className="text-xl font-bold">{p.month}</h2>
                  <p>{p.employee_name}</p>
                </div>

                <div className="text-green-600 font-bold">
                  RM {p.net_salary}
                </div>

              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 mt-4">

                <Button onClick={() => openPreview(p)}>
                  Preview
                </Button>

              </div>

            </Card>
          ))}

        </div>

        {/* ================= MODAL ================= */}
        {previewOpen && selectedPayslip && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

            <div className="bg-white w-[800px] p-8 rounded-xl">

              {/* PAYSLIP CONTENT */}
              <div id="payslip-preview">

                <h2 className="text-2xl font-bold mb-2">
                  JED PUMP SDN BHD
                </h2>

                <p className="mb-4 text-gray-500">
                  Official Payslip
                </p>

                <hr className="mb-4" />

                <p>Month: {selectedPayslip.month}</p>
                <p>Employee: {selectedPayslip.employee_name}</p>
                <p>Net Salary: RM {selectedPayslip.net_salary}</p>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>Basic: RM {selectedPayslip.salary}</div>
                  <div>Allowance: RM {selectedPayslip.allowance}</div>
                </div>

              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 mt-6">

                <Button variant="destructive" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  )
}