import { Lock } from 'lucide-react'
import { MOCK_PLAYERS, MOCK_LINEUP_GRID } from './mock-data'

const INNINGS = [1, 2, 3, 4, 5]
const PREMIUM_POSITIONS = ['P', 'C', 'SS', '1B']

export function ExampleLineupGrid() {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Interactive Lineup Grid</h3>
          <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-1 rounded-full">
            AI Generated
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Click any cell to change positions. Lock cells to preserve coach decisions.
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="text-left p-3 font-medium text-muted-foreground">
                Player
              </th>
              {INNINGS.map((inning) => (
                <th
                  key={inning}
                  className="text-center p-3 font-medium text-muted-foreground min-w-[70px]"
                >
                  Inn {inning}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_PLAYERS.map((player, playerIndex) => {
              const playerGrid = MOCK_LINEUP_GRID[(playerIndex + 1).toString()]
              return (
                <tr
                  key={player.id}
                  className="border-b last:border-b-0 hover:bg-muted/10"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {player.jersey}
                      </span>
                      <span className="font-medium">{player.name}</span>
                    </div>
                  </td>
                  {playerGrid?.map((cell, inningIndex) => (
                    <td key={inningIndex} className="p-2 text-center">
                      <div
                        className={`
                          inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium min-w-[50px]
                          ${cell.locked
                            ? 'ring-2 ring-primary/50 bg-primary/5 text-primary'
                            : cell.position === 'SIT'
                              ? 'bg-muted text-muted-foreground'
                              : PREMIUM_POSITIONS.includes(cell.position)
                                ? 'bg-muted/50 text-primary font-semibold'
                                : 'bg-muted/50 text-foreground'
                          }
                        `}
                      >
                        {cell.locked && <Lock className="h-3 w-3" />}
                        {cell.position}
                      </div>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-3">
        {MOCK_PLAYERS.slice(0, 5).map((player, playerIndex) => {
          const playerGrid = MOCK_LINEUP_GRID[(playerIndex + 1).toString()]
          return (
            <div key={player.id} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {player.jersey}
                </span>
                <span className="font-medium">{player.name}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {playerGrid?.map((cell, inningIndex) => (
                  <div
                    key={inningIndex}
                    className={`
                      flex flex-col items-center px-2 py-1 rounded text-xs
                      ${cell.locked
                        ? 'ring-1 ring-primary/50 bg-primary/5'
                        : 'bg-muted/50'
                      }
                    `}
                  >
                    <span className="text-muted-foreground text-[10px]">
                      {inningIndex + 1}
                    </span>
                    <span className={`font-medium ${cell.locked ? 'text-primary' : ''}`}>
                      {cell.locked && <Lock className="h-2.5 w-2.5 inline mr-0.5" />}
                      {cell.position}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        <p className="text-xs text-center text-muted-foreground">
          + 4 more players...
        </p>
      </div>

      {/* Legend */}
      <div className="p-3 border-t bg-muted/20 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 px-2 py-1 rounded ring-2 ring-primary/50 bg-primary/5 text-primary font-medium">
            <Lock className="h-3 w-3" />
            P
          </div>
          <span>Coach Locked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="px-2 py-1 rounded bg-muted/50 text-primary font-semibold">
            SS
          </div>
          <span>Premium Position</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="px-2 py-1 rounded bg-muted text-muted-foreground font-medium">
            SIT
          </div>
          <span>Sitting Out</span>
        </div>
      </div>
    </div>
  )
}
