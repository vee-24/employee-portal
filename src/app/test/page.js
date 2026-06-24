'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {

  useEffect(() => {
    testConnection()
  }, [])

  async function testConnection() {

    const { data, error } = await supabase
      .from('employees')
      .select('*')

    console.log('DATA:', data)
    console.log('ERROR:', error)
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        Supabase Connected Successfully ✅
      </h1>
    </div>
  )
}