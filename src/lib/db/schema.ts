// Drizzle ORM schema - add drizzle-orm and postgres packages to use
// See supabase/migrations/0001_init.sql for the full SQL schema

export type User = {
  id: string
  email: string
  name: string | null
  plan: string
  createdAt: Date
}

export type Brand = {
  id: string
  userId: string
  name: string
  domain: string
}

export type Clip = {
  id: string
  brandId: string
  title: string
  status: string
  format: string
  createdAt: Date
}
