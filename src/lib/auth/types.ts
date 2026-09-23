export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: string
}

export type UserDTO = Pick<User, "id" | "name" | "email">

export interface SessionPayload {
  userId: string
  expiresAt: Date
}

export type AuthFormState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
    }
  | undefined