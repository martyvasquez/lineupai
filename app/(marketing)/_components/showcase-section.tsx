'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExampleRoster } from './examples/example-roster'
import { ExampleLineupGrid } from './examples/example-lineup-grid'
import { ExampleLineup } from './examples/example-lineup'
import { ExampleDefensive } from './examples/example-defensive'
import { ExamplePlayerInsights } from './examples/example-player-insights'
import { ExampleTeamInsights } from './examples/example-team-insights'
import { UserCog, LayoutGrid, ListOrdered, Shield, User, Users } from 'lucide-react'

const tabs = [
  {
    value: 'lineup-grid',
    label: 'Lineup Grid',
    shortLabel: 'Grid',
    icon: LayoutGrid,
    component: ExampleLineupGrid,
  },
  {
    value: 'batting-order',
    label: 'Batting Order',
    shortLabel: 'Batting',
    icon: ListOrdered,
    component: ExampleLineup,
  },
  {
    value: 'defense',
    label: 'Defense',
    shortLabel: 'Defense',
    icon: Shield,
    component: ExampleDefensive,
  },
  {
    value: 'player-insights',
    label: 'Player Insights',
    shortLabel: 'Player',
    icon: User,
    component: ExamplePlayerInsights,
  },
  {
    value: 'team-insights',
    label: 'Team Insights',
    shortLabel: 'Team',
    icon: Users,
    component: ExampleTeamInsights,
  },
  {
    value: 'roster',
    label: 'Roster Setup',
    shortLabel: 'Roster',
    icon: UserCog,
    component: ExampleRoster,
  },
]

export function ShowcaseSection() {
  return (
    <section className="py-20 md:py-28 bg-anthropic-slate-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-fluid-3xl md:text-fluid-4xl font-semibold tracking-tight text-anthropic-cream">
            See It In Action
          </h2>
          <p className="mt-4 text-fluid-base text-anthropic-cream-muted max-w-2xl mx-auto">
            Explore how Peanut Manager transforms game-day preparation with
            AI-powered insights and smart lineup optimization.
          </p>
        </div>

        <Tabs defaultValue="lineup-grid" className="w-full">
          {/* Desktop Tabs */}
          <TabsList className="hidden md:inline-flex w-full justify-center mb-8 h-auto p-1.5 bg-anthropic-slate border border-white/10 rounded-xl">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 px-4 py-2.5 text-anthropic-cream/70 rounded-lg data-[state=active]:bg-anthropic-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Mobile Tabs (shorter labels) */}
          <TabsList className="md:hidden grid grid-cols-6 w-full mb-6 h-auto p-1 bg-anthropic-slate border border-white/10 rounded-xl">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex flex-col items-center gap-1 px-1 py-2 text-[10px] text-anthropic-cream/70 rounded-lg data-[state=active]:bg-anthropic-terracotta data-[state=active]:text-white"
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.shortLabel}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                <tab.component />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  )
}
