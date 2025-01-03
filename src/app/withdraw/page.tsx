"use client"

import { useSearchParams } from "next/navigation"

const Withdraw = () => {
  const searchParams= useSearchParams()
  const walletId = searchParams.get("id")
  
  return (
    <div>Withdraw</div>
  )
}

export default Withdraw