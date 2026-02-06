export type ProfileRow = {
  id: string
  name: string
  email: string
  password?: string
  role?: "admin" | "manager" | "auditor" | "user"
  active?: boolean
  last_login_at?: number
}
