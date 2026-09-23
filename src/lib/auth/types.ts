export interface User {
  id: string
  email: string
  password: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export type UserDTO = Pick<User, "id" | "name" | "email">

export interface SessionPayload {
  userId: string
  expiresAt: Date
  [key: string]: unknown
}

export type AuthFormState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
    }
  | undefined