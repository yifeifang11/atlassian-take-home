import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Book } from '@/models/Book'
import { UserState } from '@/models/UserState'

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(req.url)
    const shelf = searchParams.get('shelf')
    
    if (!shelf || !['read', 'toRead', 'reading', 'favorites'].includes(shelf)) {
      return NextResponse.json({ error: 'Invalid shelf parameter' }, { status: 400 })
    }

    // Get user state
    const userState = await UserState.findOne({ userId: 'default' })
    
    if (!userState) {
      return NextResponse.json({ books: [] })
    }

    let bookIds: string[] = []
    switch (shelf) {
      case 'read':
        bookIds = userState.readIds
        break
      case 'toRead':
        bookIds = userState.toReadIds
        break
      case 'reading':
        bookIds = userState.readingIds
        break
      case 'favorites':
        bookIds = userState.favoriteIds
        break
    }

    // Fetch book details
    const books = await Book.find({ id: { $in: bookIds } }).select('-embedding').lean()

    return NextResponse.json({ 
      books: books.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        genres: book.genres || [],
        description: book.description,
        coverUrl: book.coverUrl
      })),
      total: books.length
    })

  } catch (error) {
    console.error('Books API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}