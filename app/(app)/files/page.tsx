'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, MoreHorizontal, ArrowUpDown, Columns3, SlidersHorizontal, User } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/Table'
import { Badge } from '@/app/components/ui/Badge'
import { IconButton } from '@/app/components/ui/IconButton'
import { Checkbox } from '@/app/components/ui/Checkbox'
import { FilterChip } from '@/app/components/ui/FilterChip'

/* ── Types ── */

interface FileRow {
  id: string
  numId: number
  name: string
  tags: string[]
  uploadedBy: string
  uploadedOn: string
  avatarColor: string
}

/* ── Mock data ── */

const mockFiles: FileRow[] = [
  { id: 'f-001', numId: 1, name: '#037 - Work Order Summary.pdf', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '10/17/25', avatarColor: '#E5484D' },
  { id: 'f-002', numId: 6, name: 'IMG_3BCAC18AC084-1.jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-003', numId: 7, name: 'IMG_96AC485840CF-1.jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-004', numId: 8, name: 'IMG_8CA90A6CE8C3-1.jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-005', numId: 9, name: 'IMG_96AC485840CF-1.jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-006', numId: 10, name: 'download.jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-007', numId: 11, name: 'IMG_3AAC5E48B51E-1.jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-008', numId: 12, name: 'download (5).jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-009', numId: 13, name: 'IMG_0A41F8C8D2E7-1.jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-010', numId: 14, name: 'download (4).jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-011', numId: 15, name: 'IMG_D3E1A9F04B2C-1.jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-012', numId: 16, name: 'download (3).jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '09/25/25', avatarColor: '#E5484D' },
  { id: 'f-013', numId: 17, name: 'Equipment_Photo_WO1042.jpeg', tags: ['Work Order'], uploadedBy: 'Leticia Peuser', uploadedOn: '09/20/25', avatarColor: '#E5484D' },
  { id: 'f-014', numId: 18, name: 'Inspection_Report_Q3.pdf', tags: ['Inspection'], uploadedBy: 'Leticia Peuser', uploadedOn: '09/18/25', avatarColor: '#E5484D' },
  { id: 'f-015', numId: 19, name: 'Asset_Label_Printer_Room.jpeg', tags: ['Asset'], uploadedBy: 'Leticia Peuser', uploadedOn: '09/15/25', avatarColor: '#E5484D' },
  { id: 'f-016', numId: 20, name: 'Safety_Certificate_2025.pdf', tags: ['Compliance'], uploadedBy: 'Leticia Peuser', uploadedOn: '09/10/25', avatarColor: '#E5484D' },
  { id: 'f-017', numId: 21, name: 'Vendor_Invoice_Sept.pdf', tags: ['Invoice'], uploadedBy: 'Leticia Peuser', uploadedOn: '09/08/25', avatarColor: '#E5484D' },
  { id: 'f-018', numId: 22, name: 'Floor_Plan_Building_A.png', tags: ['Location'], uploadedBy: 'Leticia Peuser', uploadedOn: '09/05/25', avatarColor: '#E5484D' },
  { id: 'f-019', numId: 23, name: 'PM_Schedule_Oct_2025.xlsx', tags: ['PM'], uploadedBy: 'Leticia Peuser', uploadedOn: '09/01/25', avatarColor: '#E5484D' },
  { id: 'f-020', numId: 24, name: 'Technician_Cert_Renewal.pdf', tags: ['Compliance'], uploadedBy: 'Leticia Peuser', uploadedOn: '08/28/25', avatarColor: '#E5484D' },
  { id: 'f-021', numId: 25, name: 'download (2).jpeg', tags: [], uploadedBy: 'Leticia Peuser', uploadedOn: '08/25/25', avatarColor: '#E5484D' },
]

/* ── Avatar ── */

function UserAvatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  )
}

/* ── Main Page ── */

export default function FilesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<'uploadedOn' | 'name'>('uploadedOn')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [toolbarPortal, setToolbarPortal] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setToolbarPortal(document.getElementById('page-toolbar-portal'))
  }, [])

  const filteredFiles = useMemo(() => {
    let result = mockFiles
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(f => f.name.toLowerCase().includes(q) || f.tags.some(t => t.toLowerCase().includes(q)))
    }
    result = [...result].sort((a, b) => {
      if (sortField === 'name') {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }
      return sortDir === 'asc' ? a.numId - b.numId : b.numId - a.numId
    })
    return result
  }, [searchQuery, sortField, sortDir])

  const allSelected = filteredFiles.length > 0 && filteredFiles.every(f => selectedIds.has(f.id))
  const someSelected = filteredFiles.some(f => selectedIds.has(f.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredFiles.map(f => f.id)))
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSort = (field: 'uploadedOn' | 'name') => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const toolbarBar = (
    <div className="flex justify-center w-full bg-white border-y border-[var(--border-default)]">
      <div className="flex items-center justify-between px-6 py-2 w-full max-w-[1280px] mx-auto">
        <span className="text-[length:var(--font-size-base)] font-semibold text-[var(--color-neutral-12)]">
          {filteredFiles.length} Results Returned
        </span>
        <div className="flex items-center gap-[var(--space-sm)]">
          <button
            onClick={() => handleSort(sortField)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] rounded-[var(--radius-md)] transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            <ArrowUpDown size={14} />
            Sort: {sortField === 'uploadedOn' ? 'Uploaded On' : 'Name'}
          </button>
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-9)] hover:bg-[var(--color-neutral-3)] rounded-[var(--radius-md)] transition-colors duration-[var(--duration-fast)] cursor-pointer">
            <Columns3 size={14} />
            Columns
          </button>
          <div className="flex items-center gap-[var(--space-xs)] px-3 py-1.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)]">
            <Search size={14} className="text-[var(--color-neutral-7)] shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[120px] text-[length:var(--font-size-sm)] bg-transparent outline-none text-[var(--color-neutral-11)] placeholder:text-[var(--color-neutral-7)]"
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Tooltip.Provider delayDuration={300}>
      {toolbarPortal && createPortal(toolbarBar, toolbarPortal)}
      <div className="flex flex-col flex-1 w-full">
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-[var(--space-2xl)] py-[var(--space-xl)]">
            {/* Filter bar */}
            <div
              className="flex items-center gap-2 mb-4 flex-wrap opacity-0"
              style={{ animation: 'fadeInUp 0.35s var(--ease-default) 0.04s forwards' }}
            >
              <FilterChip icon={<SlidersHorizontal size={13} />}>
                Filters
              </FilterChip>
              <FilterChip hasDropdown icon={<User size={13} />}>
                Assigned To
              </FilterChip>

              <div className="flex-1" />

              <button
                type="button"
                className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-neutral-8)] hover:text-[var(--color-neutral-11)] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                type="button"
                className="text-[length:var(--font-size-sm)] font-medium text-[var(--color-accent-9)] hover:text-[var(--color-accent-10)] transition-colors cursor-pointer"
              >
                Save View
              </button>
            </div>

            <div
              className="bg-[var(--surface-primary)] rounded-[var(--widget-radius)] border border-[var(--widget-border)] shadow-[var(--widget-shadow)] overflow-hidden opacity-0"
              style={{ animation: 'fadeInUp 0.4s var(--ease-default) 0.05s forwards' }}
            >
              {/* Table */}
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead className="w-10 !px-3">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="w-16 !pl-0">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => handleSort('uploadedOn')}>
                      <span className="inline-flex items-center gap-1">
                        Uploaded On
                        {sortField === 'uploadedOn' && (
                          <ArrowUpDown size={12} className="text-[var(--color-neutral-7)]" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead className="w-12" />
                  </tr>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => {
                    const isSelected = selectedIds.has(file.id)
                    return (
                      <TableRow
                        key={file.id}
                        className={`cursor-pointer ${isSelected ? 'bg-[var(--color-accent-1)]' : ''}`}
                      >
                        <TableCell className="w-10 !px-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleOne(file.id)}
                          />
                        </TableCell>
                        <TableCell className="!pl-0 text-[var(--color-neutral-8)] font-mono text-[length:var(--font-size-xs)]">
                          {file.numId}
                        </TableCell>
                        <TableCell className="font-medium text-[var(--color-neutral-12)]">
                          {file.name}
                        </TableCell>
                        <TableCell>
                          {file.tags.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {file.tags.map((t) => (
                                <Badge key={t} severity="neutral" variant="outline" size="sm">{t}</Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[var(--color-neutral-6)]">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserAvatar name={file.uploadedBy} color={file.avatarColor} />
                            <span>{file.uploadedBy}</span>
                          </div>
                        </TableCell>
                        <TableCell>{file.uploadedOn}</TableCell>
                        <TableCell className="w-12 text-right">
                          <IconButton
                            variant="ghost"
                            size="sm"
                            label="Actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal size={14} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </Tooltip.Provider>
  )
}
