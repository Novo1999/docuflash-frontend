import { Preset } from "@/types/file"

const PRESET_TOLERANCE_MS = 60_000
const PRESETS: Preset[] = [
  { key: '1h', label: '1 hour', hours: 1 },
  { key: '6h', label: '6 hours', hours: 6 },
  { key: '24h', label: '24 hours', hours: 24 },
  { key: '3d', label: '3 days', hours: 72 },
  { key: '7d', label: '7 days', hours: 168 },
]


export { PRESET_TOLERANCE_MS, PRESETS }
