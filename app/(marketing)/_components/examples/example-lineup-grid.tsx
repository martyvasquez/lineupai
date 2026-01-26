import { Lock } from 'lucide-react'
import { MOCK_PLAYERS, MOCK_LINEUP_GRID } from './mock-data'

const INNINGS = [1, 2, 3, 4, 5]
const PREMIUM_POSITIONS = ['P', 'C', 'SS', '1B']

export function ExampleLineupGrid() {
  return (
    <div className="bg-anthropic-slate-elevated rounded-lg border border-white/10 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-anthropic-cream-subtle">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-anthropic-cream">Interactive Lineup Grid</h3>
          <span className="text-xs text-anthropic-terracotta bg-anthropic-terracotta/10 px-2 py-1 rounded-full">
            AI Generated
          </span>
        </div>
        <p className="text-sm text-anthropic-cream-muted mt-1">
          Click any cell to change positions. Lock cells to preserve coach decisions.
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-anthropic-cream-subtle">
              <th className="text-left p-3 font-medium text-anthropic-cream-muted">
                Player
              </th>
              {INNINGS.map((inning) => (
                <th
                  key={inning}
                  className="text-center p-3 font-medium text-anthropic-cream-muted min-w-[70px]"
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
                  className="border-b border-white/5 last:border-b-0 hover:bg-white/5"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-anthropic-terracotta/10 text-anthropic-terracotta text-xs font-bold">
                        {player.jersey}
                      </span>
                      <span className="font-medium text-anthropic-cream">{player.name}</span>
                    </div>
                  </td>
                  {playerGrid?.map((cell, inningIndex) => (
                    <td key={inningIndex} className="p-2 text-center">
                      <div
                        className={`
                          inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium min-w-[50px]
                          ${cell.locked
                            ? 'ring-2 ring-anthropic-terracotta/50 bg-anthropic-terracotta/10 text-anthropic-terracotta'
                            : cell.position === 'SIT'
                              ? 'bg-white/5 text-anthropic-cream-muted'
                              : PREMIUM_POSITIONS.includes(cell.position)
                                ? 'bg-white/10 text-anthropic-terracotta font-semibold'
                                : 'bg-white/10 text-anthropic-cream'
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
            <div key={player.id} className="border border-white/10 rounded-lg p-3 bg-anthropic-cream-subtle">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-anthropic-terracotta/10 text-anthropic-terracotta text-xs font-bold">
                  {player.jersey}
                </span>
                <span className="font-medium text-anthropic-cream">{player.name}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {playerGrid?.map((cell, inningIndex) => (
                  <div
                    key={inningIndex}
                    className={`
                      flex flex-col items-center px-2 py-1 rounded text-xs
                      ${cell.locked
                        ? 'ring-1 ring-anthropic-terracotta/50 bg-anthropic-terracotta/10'
                        : 'bg-white/10'
                      }
                    `}
                  >
                    <span className="text-anthropic-cream-muted text-[10px]">
                      {inningIndex + 1}
                    </span>
                    <span className={`font-medium ${cell.locked ? 'text-anthropic-terracotta' : 'text-anthropic-cream'}`}>
                      {cell.locked && <Lock className="h-2.5 w-2.5 inline mr-0.5" />}
                      {cell.position}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        <p className="text-xs text-center text-anthropic-cream-muted">
          + 4 more players...
        </p>
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-white/10 bg-anthropic-cream-subtle flex flex-wrap gap-4 text-xs text-anthropic-cream-muted">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 px-2 py-1 rounded ring-2 ring-anthropic-terracotta/50 bg-anthropic-terracotta/10 text-anthropic-terracotta font-medium">
            <Lock className="h-3 w-3" />
            P
          </div>
          <span>Coach Locked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="px-2 py-1 rounded bg-white/10 text-anthropic-terracotta font-semibold">
            SS
          </div>
          <span>Premium Position</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="px-2 py-1 rounded bg-white/5 text-anthropic-cream-muted font-medium">
            SIT
          </div>
          <span>Sitting Out</span>
        </div>
      </div>
    </div>
  )
}
