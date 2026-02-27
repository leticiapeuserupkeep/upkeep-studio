import { ShoppingCart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Button } from '@/app/components/ui/Button'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/app/components/ui/Table'
import type { StockoutResult } from '@/app/lib/models'
import { urgencyToSeverity } from '@/app/components/ui/UrgencyBadge'

interface PartsRiskProps {
  parts: StockoutResult[]
}

export function PartsRisk({ parts }: PartsRiskProps) {
  return (
    <Card>
      <CardHeader
        action={
          <Button variant="secondary" size="sm">
            <ShoppingCart size={14} /> Create PO
          </Button>
        }
      >
        <CardTitle>Parts Risk Monitor</CardTitle>
        <CardDescription>{parts.filter((p) => p.riskLevel === 'critical' || p.riskLevel === 'high').length} parts need attention</CardDescription>
      </CardHeader>

      <div className="px-[var(--widget-padding)] pb-[var(--widget-padding)]">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Part</TableHead>
              <TableHead>On Hand</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Stockout</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Best Price</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {parts.map((part) => {
              const bestVendor = part.vendors.sort((a, b) => a.lastPrice - b.lastPrice)[0]
              return (
                <TableRow key={part.id}>
                  <TableCell>
                    <span className="font-medium">{part.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className={part.onHand < part.minRequired ? 'text-[var(--color-error)] font-semibold' : ''}>
                      {part.onHand}
                    </span>
                  </TableCell>
                  <TableCell>{part.minRequired}</TableCell>
                  <TableCell>
                    <span className="tabular-nums">{part.daysUntilStockout}d</span>
                  </TableCell>
                  <TableCell>
                    <Badge severity={urgencyToSeverity[part.riskLevel]}>{part.urgencyLabel}</Badge>
                  </TableCell>
                  <TableCell>
                    {bestVendor && (
                      <span className="text-[length:var(--font-size-xs)] text-[var(--color-neutral-8)]">
                        ${bestVendor.lastPrice} — {bestVendor.name}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
