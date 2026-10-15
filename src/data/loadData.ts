import raw from './staffing_data.json'
import type { StaffingData } from '../types'

// Mirrored from /staffing-challenge-data at the repo root, which is the
// file Nymbl actually handed over. This copy exists because Vite's dev
// server needs the JSON inside the project root to type it with
// resolveJsonModule; the root copy stays the source of truth.
export const staffingData = raw as StaffingData
