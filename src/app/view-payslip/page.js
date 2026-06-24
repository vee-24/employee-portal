'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { supabase } from '@/lib/supabase'

import {
  Card,
  CardContent
} from '@/components/ui/card'

export default function ViewPayslipPage() {

  const [payslips, setPayslips] = useState([])
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  //////////////////////////////////////////////////
  // LOAD CURRENT USER
  //////////////////////////////////////////////////

  useEffect(() => {

    const user = JSON.parse(
      localStorage.getItem('currentUser')
    )

    if (user) {

      setEmployee(user)

      fetchPayslips(user.empid)

    }

  }, [])

  //////////////////////////////////////////////////
  // FETCH PAYSLIPS
  //////////////////////////////////////////////////

  async function fetchPayslips(empid) {

    const { data, error } = await supabase
      .from('payslips')
      .select('*')
      .eq('employee_id', empid)
      .order('id', { ascending: false })

    if (error) {

      console.log(error)

    } else {

      setPayslips(data)

    }

    setLoading(false)
  }

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////

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
            className="px-6 py-4 hover:bg-white/10 transition"
          >
            Clock In / Out
          </Link>

          <Link
            href="/view-payslip"
            className="px-6 py-4 bg-white text-[#3b5b8a] font-semibold"
          >
            View Payslip
          </Link>

          <Link
  href="/apply-leave"
  className="px-6 py-4 hover:bg-white/10 transition"
>
  Apply Leave
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
    Hello {employee?.name} 👋
  </h2>

  <p className="text-gray-500 mt-1">
    Home &gt; Employee &gt; View Payslip
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

{/* PAGE TITLE */}
<div className="mb-8">

<h1 className="text-4xl font-bold text-[#3b5b8a]">
  My Payslips
</h1>

<p className="text-gray-500 mt-2">
  View your salary records
</p>

</div>

        {/* PAYSLIPS */}
        {loading ? (

          <p>Loading payslips...</p>

        ) : payslips.length === 0 ? (

          <Card className="rounded-3xl border-0 shadow-xl bg-white">

            <CardContent className="p-10">

              <p className="text-gray-500">
                No payslips found.
              </p>

            </CardContent>

          </Card>

        ) : (

          <div className="space-y-6">

            {payslips.map((payslip) => (

              <Card
                key={payslip.id}
                className="rounded-3xl border-0 shadow-xl bg-white"
              >

                <CardContent className="p-8">

                  <div className="flex justify-between items-start">

                    <div>

                      <h2 className="text-2xl font-bold text-[#3b5b8a]">

                        {payslip.month}

                      </h2>

                      <p className="text-gray-500 mt-1">

                        Employee:
                        {' '}
                        {payslip.employee_name}

                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-sm text-gray-500">
                        Net Salary
                      </p>

                      <h2 className="text-3xl font-bold text-green-600">

                        RM {payslip.net_salary}

                      </h2>

                    </div>

                  </div>

                  {/* DETAILS */}
                  <div className="grid grid-cols-3 gap-6 mt-8">

                    <div className="bg-[#f5f7fb] rounded-2xl p-5">

                      <p className="text-sm text-gray-500">
                        Basic Salary
                      </p>

                      <h3 className="text-2xl font-bold mt-2">

                        RM {payslip.salary}

                      </h3>

                    </div>

                    <div className="bg-[#f5f7fb] rounded-2xl p-5">

                      <p className="text-sm text-gray-500">
                        Allowance
                      </p>

                      <h3 className="text-2xl font-bold mt-2">

                        RM {payslip.allowance}

                      </h3>

                    </div>

                    <div className="bg-[#f5f7fb] rounded-2xl p-5">

  <p className="text-sm text-gray-500">
    EPF + SOCSO
  </p>

  <h3 className="text-2xl font-bold mt-2 text-red-500">

    RM {
      (
        (payslip.salary + payslip.allowance + (payslip.ot_rate * payslip.ot_hours))
        * (payslip.epf_percent / 100)
      +
        (payslip.salary + payslip.allowance + (payslip.ot_rate * payslip.ot_hours))
        * (payslip.socso_percent / 100)
      ).toFixed(2)
    }

  </h3>

</div>

                  </div>

                </CardContent>

              </Card>

            ))}

          </div>

        )}

      </div>

    </div>
  )
}