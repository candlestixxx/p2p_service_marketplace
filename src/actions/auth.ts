"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export async function login(formData: FormData) {
  try {
    await signIn("credentials", formData)
  } catch (error) {
    if (isRedirectError(error)) {
        throw error;
    }
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message || "Invalid credentials." }
    }
    throw error
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" })
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as string // "CLIENT" or "PROVIDER"

  if (!email || !password || !name) {
    return { error: "Please fill out all fields." }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "Email already in use." }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: role === "PROVIDER" ? "PROVIDER" : "CLIENT",
    },
  })

  try {
      // Automatically sign them in
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
  } catch (error) {
     if (isRedirectError(error)) {
        throw error;
     }
  }
  return { success: true }
}
