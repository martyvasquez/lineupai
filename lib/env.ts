/**
 * Environment variable validation
 *
 * This module validates that all required environment variables are set.
 * It should be imported early in the application lifecycle (e.g., in app/layout.tsx)
 * to fail fast if configuration is missing.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
] as const

type RequiredEnvVar = typeof requiredEnvVars[number]

function validateEnv(): void {
  const missing: RequiredEnvVar[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\nPlease add these to your .env.local file.`

    // In development, log a warning but don't crash (allows partial testing)
    if (process.env.NODE_ENV === 'development') {
      console.warn(`\n⚠️  Environment Warning:\n${message}\n`)
    } else {
      // In production, throw an error to fail fast
      throw new Error(message)
    }
  }
}

// Validate on module load
validateEnv()

// Export validated env vars with type safety
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const
