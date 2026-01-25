'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { parseGameChangerCSV, type ParsedPlayerStats } from '@/lib/parsers/gamechanger-csv'
import { useToast } from '@/lib/hooks/use-toast'

interface ImportedPlayer {
  id: string
  name: string
  jersey_number: number | null
}

interface RosterImportInlineProps {
  teamId: string
  onImportComplete?: (players: ImportedPlayer[]) => void
}

export function RosterImportInline({ teamId, onImportComplete }: RosterImportInlineProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedPlayers, setParsedPlayers] = useState<ParsedPlayerStats[]>([])
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [includeStats, setIncludeStats] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imported, setImported] = useState(false)

  const { toast } = useToast()

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile)
    setError(null)
    setParsing(true)
    setParsedPlayers([])

    try {
      const text = await selectedFile.text()
      const players = parseGameChangerCSV(text)

      if (players.length === 0) {
        setError('No players found in CSV. Make sure it\'s a GameChanger export.')
        return
      }

      setParsedPlayers(players)
    } catch (err) {
      console.error('Parse error:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file')
    } finally {
      setParsing(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      handleFileSelect(droppedFile)
    } else {
      setError('Please upload a CSV file')
    }
  }, [handleFileSelect])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  async function handleImport() {
    if (parsedPlayers.length === 0) return

    setImporting(true)
    setError(null)

    try {
      const response = await fetch('/api/import/roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: teamId,
          players: parsedPlayers,
          include_stats: includeStats,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setImported(true)
      toast({
        title: 'Roster imported successfully',
        description: `${data.created_count} players added${includeStats ? ' with stats' : ''}.`,
      })

      onImportComplete?.(data.players || [])
    } catch (err) {
      console.error('Import error:', err)
      setError(err instanceof Error ? err.message : 'Failed to import roster')
      toast({
        title: 'Import failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
    }
  }

  function resetImport() {
    setFile(null)
    setParsedPlayers([])
    setError(null)
    setImported(false)
  }

  // Success state
  if (imported) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">Roster Imported!</h3>
          <p className="text-sm text-green-700 text-center">
            {parsedPlayers.length} players have been added to your team
            {includeStats ? ' with their stats' : ''}.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* File Upload Zone */}
      {parsedPlayers.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/25"
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="csv-upload-inline"
          />
          <label htmlFor="csv-upload-inline" className="cursor-pointer">
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {parsing ? 'Parsing...' : 'Drop GameChanger CSV here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground">
              Export your roster from GameChanger app
            </p>
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Preview Table */}
      {parsedPlayers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{file?.name}</span>
              <span className="text-xs text-muted-foreground">
                ({parsedPlayers.length} players)
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={resetImport}>
              Change File
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden max-h-[250px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">AVG</TableHead>
                  <TableHead className="text-right">OBP</TableHead>
                  <TableHead className="text-right">H</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedPlayers.map((player, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{player.jersey_number}</TableCell>
                    <TableCell>{player.first_name} {player.last_name}</TableCell>
                    <TableCell className="text-right">
                      {player.batting.avg.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right">
                      {player.batting.obp.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right">{player.batting.h}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Include Stats Toggle */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <Switch
              id="include-stats-inline"
              checked={includeStats}
              onCheckedChange={setIncludeStats}
            />
            <div className="flex-1">
              <Label htmlFor="include-stats-inline" className="font-medium cursor-pointer">
                Import stats too
              </Label>
              <p className="text-xs text-muted-foreground">
                Include batting and fielding statistics from the CSV
              </p>
            </div>
          </div>

          {/* Action Button */}
          <Button onClick={handleImport} disabled={importing} className="w-full">
            <Users className="h-4 w-4 mr-2" />
            {importing ? 'Importing...' : `Import ${parsedPlayers.length} Players`}
          </Button>
        </div>
      )}
    </div>
  )
}
