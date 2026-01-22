import Papa from 'papaparse'

export interface ParsedBattingStats {
  gp: number
  pa: number
  ab: number
  avg: number
  obp: number
  slg: number
  ops: number
  h: number
  singles: number
  doubles: number
  triples: number
  hr: number
  rbi: number
  r: number
  bb: number
  so: number
  hbp: number
  sb: number
  cs: number
}

export interface ParsedFieldingStats {
  tc: number
  a: number
  po: number
  fpct: number
  e: number
  dp: number
}

export interface ParsedPitchingStats {
  ip: number
  era: number
  whip: number
  so: number
  bb: number
  h: number
  r: number
  er: number
}

export interface ParsedPlayerStats {
  jersey_number: number
  last_name: string
  first_name: string
  batting: ParsedBattingStats
  fielding: ParsedFieldingStats
  pitching: ParsedPitchingStats | null
}

function parseNumber(value: string | undefined): number {
  if (!value || value === '-' || value === 'N/A' || value === '') {
    return 0
  }
  // Remove percentage signs and handle decimals
  const cleaned = value.replace('%', '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function parseInnings(value: string | undefined): number {
  if (!value || value === '-' || value === 'N/A' || value === '') {
    return 0
  }
  // Innings can be like "6.2" meaning 6 and 2/3 innings
  // But for simplicity, just parse as float
  const num = parseFloat(value)
  return isNaN(num) ? 0 : num
}

export function parseGameChangerCSV(csvText: string): ParsedPlayerStats[] {
  // Parse CSV with papaparse
  const result = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
  })

  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors)
  }

  const rows = result.data

  // Find header row (row with "Number", "Last", "First", etc.)
  // Usually row 2 (index 1) but let's search for it
  let headerRowIndex = -1
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i]
    if (row && row[0] === 'Number' && row[1] === 'Last' && row[2] === 'First') {
      headerRowIndex = i
      break
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('Could not find header row in CSV')
  }

  const headers = rows[headerRowIndex]

  // Build column index map
  const colIndex: Record<string, number> = {}
  headers.forEach((header, index) => {
    // Handle duplicate column names by appending section prefix
    // The CSV has duplicates like GP, H, SO appearing in both batting and pitching sections
    if (colIndex[header] !== undefined) {
      // This is a duplicate - likely in pitching or fielding section
      // Use position to determine section
      // Batting section is roughly columns 0-53
      // Pitching section is roughly columns 54-146
      // Fielding section is roughly columns 147+
      if (index > 140) {
        colIndex[`fielding_${header}`] = index
      } else if (index > 50) {
        colIndex[`pitching_${header}`] = index
      }
    } else {
      colIndex[header] = index
    }
  })

  // Find specific column indices for fielding stats
  // These appear near the end of the row
  // Look for TC, A, PO, FPCT, E, DP in the fielding section
  let tcIndex = -1, aIndex = -1, poIndex = -1, fpctIndex = -1, eIndex = -1, dpIndex = -1

  for (let i = headers.length - 50; i < headers.length; i++) {
    const h = headers[i]
    if (h === 'TC' && tcIndex === -1) tcIndex = i
    if (h === 'A' && tcIndex !== -1 && aIndex === -1) aIndex = i
    if (h === 'PO' && aIndex !== -1 && poIndex === -1) poIndex = i
    if (h === 'FPCT' && poIndex !== -1 && fpctIndex === -1) fpctIndex = i
    if (h === 'E' && fpctIndex !== -1 && eIndex === -1) eIndex = i
    if (h === 'DP' && eIndex !== -1 && dpIndex === -1) dpIndex = i
  }

  // Find pitching column indices (after batting, before fielding)
  // IP, ERA, WHIP are in pitching section
  let ipIndex = -1, eraIndex = -1, whipIndex = -1
  let pitchingSO = -1, pitchingBB = -1, pitchingH = -1, pitchingR = -1, pitchingER = -1

  for (let i = 50; i < 150; i++) {
    const h = headers[i]
    if (h === 'IP' && ipIndex === -1) ipIndex = i
    if (h === 'ERA' && ipIndex !== -1 && eraIndex === -1) eraIndex = i
    if (h === 'WHIP' && eraIndex !== -1 && whipIndex === -1) whipIndex = i
    if (h === 'SO' && ipIndex !== -1 && pitchingSO === -1) pitchingSO = i
    if (h === 'BB' && ipIndex !== -1 && pitchingBB === -1) pitchingBB = i
    if (h === 'H' && ipIndex !== -1 && pitchingH === -1) pitchingH = i
    if (h === 'R' && ipIndex !== -1 && pitchingR === -1) pitchingR = i
    if (h === 'ER' && pitchingR !== -1 && pitchingER === -1) pitchingER = i
  }

  const players: ParsedPlayerStats[] = []

  // Process data rows (after header)
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i]

    // Skip empty rows
    if (!row || row.length === 0 || !row[0]) {
      continue
    }

    // Skip "Totals" row
    if (row[0] === 'Totals') {
      continue
    }

    // Skip glossary rows (check if first column is non-numeric and not a jersey number)
    if (row[0] === 'Glossary' || row[0] === '') {
      break // Stop processing at glossary
    }

    // Parse jersey number - skip if not a valid number
    const jerseyNum = parseInt(row[0], 10)
    if (isNaN(jerseyNum)) {
      continue
    }

    const lastName = row[1] || ''
    const firstName = row[2] || ''

    // Parse batting stats
    const batting: ParsedBattingStats = {
      gp: parseNumber(row[colIndex['GP']]),
      pa: parseNumber(row[colIndex['PA']]),
      ab: parseNumber(row[colIndex['AB']]),
      avg: parseNumber(row[colIndex['AVG']]),
      obp: parseNumber(row[colIndex['OBP']]),
      slg: parseNumber(row[colIndex['SLG']]),
      ops: parseNumber(row[colIndex['OPS']]),
      h: parseNumber(row[colIndex['H']]),
      singles: parseNumber(row[colIndex['1B']]),
      doubles: parseNumber(row[colIndex['2B']]),
      triples: parseNumber(row[colIndex['3B']]),
      hr: parseNumber(row[colIndex['HR']]),
      rbi: parseNumber(row[colIndex['RBI']]),
      r: parseNumber(row[colIndex['R']]),
      bb: parseNumber(row[colIndex['BB']]),
      so: parseNumber(row[colIndex['SO']]),
      hbp: parseNumber(row[colIndex['HBP']]),
      sb: parseNumber(row[colIndex['SB']]),
      cs: parseNumber(row[colIndex['CS']]),
    }

    // Parse fielding stats
    const fielding: ParsedFieldingStats = {
      tc: tcIndex !== -1 ? parseNumber(row[tcIndex]) : 0,
      a: aIndex !== -1 ? parseNumber(row[aIndex]) : 0,
      po: poIndex !== -1 ? parseNumber(row[poIndex]) : 0,
      fpct: fpctIndex !== -1 ? parseNumber(row[fpctIndex]) : 0,
      e: eIndex !== -1 ? parseNumber(row[eIndex]) : 0,
      dp: dpIndex !== -1 ? parseNumber(row[dpIndex]) : 0,
    }

    // Parse pitching stats (only if player has pitched)
    let pitching: ParsedPitchingStats | null = null
    const ip = ipIndex !== -1 ? parseInnings(row[ipIndex]) : 0
    if (ip > 0) {
      pitching = {
        ip,
        era: eraIndex !== -1 ? parseNumber(row[eraIndex]) : 0,
        whip: whipIndex !== -1 ? parseNumber(row[whipIndex]) : 0,
        so: pitchingSO !== -1 ? parseNumber(row[pitchingSO]) : 0,
        bb: pitchingBB !== -1 ? parseNumber(row[pitchingBB]) : 0,
        h: pitchingH !== -1 ? parseNumber(row[pitchingH]) : 0,
        r: pitchingR !== -1 ? parseNumber(row[pitchingR]) : 0,
        er: pitchingER !== -1 ? parseNumber(row[pitchingER]) : 0,
      }
    }

    players.push({
      jersey_number: jerseyNum,
      last_name: lastName,
      first_name: firstName,
      batting,
      fielding,
      pitching,
    })
  }

  return players
}

export interface MatchResult {
  parsed: ParsedPlayerStats
  player_id: string | null
  player_name: string | null
  matched_by: 'jersey_number' | 'name' | null
}

export interface Player {
  id: string
  name: string
  jersey_number: number | null
}

export function matchPlayers(
  parsedStats: ParsedPlayerStats[],
  rosterPlayers: Player[]
): MatchResult[] {
  return parsedStats.map(parsed => {
    // First try to match by jersey number
    const byJersey = rosterPlayers.find(p => p.jersey_number === parsed.jersey_number)
    if (byJersey) {
      return {
        parsed,
        player_id: byJersey.id,
        player_name: byJersey.name,
        matched_by: 'jersey_number' as const,
      }
    }

    // Try fuzzy name match (last name + first initial)
    const fullName = `${parsed.first_name} ${parsed.last_name}`.toLowerCase()
    const byName = rosterPlayers.find(p => {
      const rosterName = p.name.toLowerCase()
      // Check if names match closely
      return rosterName === fullName ||
        rosterName.includes(parsed.last_name.toLowerCase()) ||
        fullName.includes(rosterName)
    })

    if (byName) {
      return {
        parsed,
        player_id: byName.id,
        player_name: byName.name,
        matched_by: 'name' as const,
      }
    }

    // No match found
    return {
      parsed,
      player_id: null,
      player_name: null,
      matched_by: null,
    }
  })
}
