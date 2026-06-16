"use client"

import { Button } from "@/components/ui/button"
import { logout } from "@/actions/auth"
import Link from "next/link"

export function LoginButton() {
  return (
    <Button variant="outline" asChild>
      <Link href="/login">Login</Link>
    </Button>
  )
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button variant="outline" type="submit">
        Logout
      </Button>
    </form>
  )
}
