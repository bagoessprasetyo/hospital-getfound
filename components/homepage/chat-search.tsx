'use client'

import { useState } from 'react'
import { Search, Send, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatSearchProps {
  onSearch?: (query: string) => void
}

export function ChatSearch({ onSearch }: ChatSearchProps) {
  const [query, setQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsTyping(true)
      onSearch?.(query.trim())
      // Simulate processing time
      setTimeout(() => {
        setIsTyping(false)
        // Redirect to hospitals page with search query
        window.location.href = `/hospitals?search=${encodeURIComponent(query.trim())}`
      }, 1000)
    }
  }

  const suggestionQueries = [
    "I need a cardiologist near me",
    "Find pediatric hospitals",
    "Emergency care available now",
    "Orthopedic specialists"
  ]

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Chat Interface Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-primary-500 rounded-full">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Healthcare Assistant
          </h3>
          <p className="text-sm text-gray-600">
            Tell me what kind of medical care you need
          </p>
        </div>
      </div>

      {/* Chat Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your healthcare needs... (e.g., 'I need a heart specialist' or 'Find emergency care near me')"
            className="w-full h-14 pl-6 pr-16 text-base border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 shadow-sm"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!query.trim() || isTyping}
            className="absolute right-2 h-10 w-10 p-0 bg-primary-500 hover:bg-primary-600 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </Button>
        </div>
      </form>

      {/* Quick Suggestions */}
      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-3">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {suggestionQueries.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setQuery(suggestion)}
              className="px-4 py-2 text-sm bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors duration-200 border border-primary-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Processing State */}
      {isTyping && (
        <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-primary-800 font-medium">Processing your request...</p>
              <p className="text-primary-600 text-sm">Finding the best healthcare options for you</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}