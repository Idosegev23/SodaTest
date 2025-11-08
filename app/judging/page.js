'use client'

import PasswordProtection from '../../components/stats/PasswordProtection'
import SwipeJudgingInterface from '../../components/judging/SwipeJudgingInterface'

export default function JudgingPage() {
  return (
    <PasswordProtection>
      <SwipeJudgingInterface />
    </PasswordProtection>
  )
}

