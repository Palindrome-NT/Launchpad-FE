import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    backendToken?: string
    refreshToken?: string
    userId?: string
    idToken?: string
    user?: {
      _id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      picture?: string | null
      provider?: string
      role?: string
      isVerified?: boolean
      isActive?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string
    refreshToken?: string
    userId?: string
    idToken?: string
    user?: any
  }
}