'use client'

import { formatBytes } from '@/app/utils/uploadEntries'
import EmptyPreview from '@/components/file/EmptyPreview'
import PreviewLoader from '@/components/shared/PreviewLoader'
import JSZip from 'jszip'
import { useEffect, useState } from 'react'
import { LuFile, LuFolderArchive } from 'react-icons/lu'

type ZipEntry = { path: string; size: number }

const ZipPreview = ({ url }: { url: string }) => {
  const [entries, setEntries] = useState<ZipEntry[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadZip = async () => {
      try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)

        const collected: ZipEntry[] = []
        zip.forEach((relativePath, file) => {
          if (file.dir) return
          const size = (file as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize ?? 0
          collected.push({ path: relativePath, size })
        })
        collected.sort((a, b) => a.path.localeCompare(b.path))
        setEntries(collected)
      } catch {
        setError(true)
      }
    }
    loadZip()
  }, [url])

  if (error) return <EmptyPreview copy="Failed to read this archive." />
  if (!entries) return <PreviewLoader label="Reading archive" />
  if (entries.length === 0) return <EmptyPreview copy="This archive is empty." />

  const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0)

  return (
    <div className="flex flex-col gap-3 font-sans">
      <div className="flex items-center gap-2 text-sm text-[var(--ink-600)]">
        <LuFolderArchive className="w-4 h-4" />
        <span>
          {entries.length} {entries.length === 1 ? 'file' : 'files'} · {formatBytes(totalSize)}
        </span>
      </div>
      <ul className="flex flex-col rounded-xl border border-line bg-surface divide-y divide-[var(--line)] max-h-[420px] overflow-auto">
        {entries.map((entry) => (
          <li key={entry.path} className="flex items-center gap-3 px-4 py-2.5">
            <LuFile className="w-4 h-4 text-[var(--ink-600)] shrink-0" />
            <span className="text-sm text-[var(--ink-900)] truncate flex-1 min-w-0" title={entry.path}>
              {entry.path}
            </span>
            <span className="text-xs text-[var(--ink-600)] shrink-0">{formatBytes(entry.size)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ZipPreview
