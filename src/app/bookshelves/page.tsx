'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BookshelvesRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to profile page which now contains the bookshelves
    router.replace('/profile')
  }, [router])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <p>Redirecting to your library...</p>
      </div>
    </div>
  )
}