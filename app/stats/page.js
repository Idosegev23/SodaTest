'use client'

import { useState, useEffect } from 'react'
import PasswordProtection from '../../components/stats/PasswordProtection'
import StatsDashboard from '../../components/stats/StatsDashboard'

export default function StatsPage() {
  return (
    <PasswordProtection>
      <StatsDashboard />
    </PasswordProtection>
  )
}

