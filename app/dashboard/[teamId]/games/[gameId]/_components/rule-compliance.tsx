'use client'

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { RuleCheck } from '@/types/lineup'

interface RuleComplianceProps {
  rulesCheck: RuleCheck[]
  warnings: string[]
}

export function RuleCompliance({ rulesCheck, warnings }: RuleComplianceProps) {
  return (
    <div className="space-y-4">
      {/* Rules Check */}
      <div className="space-y-2">
        {rulesCheck.map((check, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-2 rounded-lg border"
          >
            {check.satisfied ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{check.rule}</p>
              {check.details && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {check.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Warnings
          </h4>
          <div className="space-y-1">
            {warnings.map((warning, index) => (
              <p key={index} className="text-sm text-amber-600 pl-6">
                {warning}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
