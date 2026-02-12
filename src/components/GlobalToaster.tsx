"use client"

import { Toaster } from "sonner"

export function GlobalToaster() {
  return (
    <Toaster
      position="bottom-right"   // posisi toast
      richColors                // aktifkan warna bawaan (success, error, warning)
      closeButton               // biar user bisa tutup toast manual
    />
  )
}
