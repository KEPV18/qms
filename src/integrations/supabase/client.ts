import { createClient } from "@supabase/supabase-js"

const envObj: Record<string, unknown> = (import.meta as unknown as { env?: Record<string, unknown> }).env || {}
const SUPABASE_URL = typeof envObj.VITE_SUPABASE_URL === "string" ? envObj.VITE_SUPABASE_URL : undefined
const SUPABASE_PUBLISHABLE_KEY = typeof envObj.VITE_SUPABASE_PUBLISHABLE_KEY === "string" ? envObj.VITE_SUPABASE_PUBLISHABLE_KEY : undefined

export const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
  ? createClient(SUPABASE_URL.replace(/`/g, "").trim(), SUPABASE_PUBLISHABLE_KEY.trim())
  : null
