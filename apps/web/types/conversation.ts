import type { Channel, Sentiment } from './lead'

export interface Message {
  id: string
  conversation_id: string
  content: string
  sender: 'user' | 'lead' | 'ai'
  timestamp: string
}

export interface ConversationThread {
  id: string
  lead_id: string
  channel: Channel
  messages: Message[]
  last_message_at: string
  status: 'active' | 'closed'
}

export interface ConversationAnalysis {
  sentiment: Sentiment
  intent: string
  next_action_suggested: string
  confidence_score: number
}

