export type LeadType = 'codetix' | 'reservaspro'

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'interested' 
  | 'call_scheduled' 
  | 'closed' 
  | 'lost'

export type Channel = 
  | 'email' 
  | 'linkedin' 
  | 'whatsapp' 
  | 'instagram'

export type Sentiment = 
  | 'interested' 
  | 'needs_info' 
  | 'not_now' 
  | 'not_interested' 
  | 'auto_reply'

export interface Lead {
  id: string
  company_name: string
  email?: string
  phone?: string
  linkedin_url?: string
  instagram_url?: string
  website?: string
  type: LeadType
  score: number
  status: LeadStatus
  industry?: string
  location?: string
  employee_count?: number
  problem_detected?: string
  insight?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  lead_id: string
  channel: Channel
  message_sent: string
  message_received?: string
  sentiment?: Sentiment
  created_at: string
}

export interface OutreachSequence {
  id: string
  lead_id: string
  sequence_type: string
  current_step: number
  next_action_date: string
  status: 'active' | 'paused' | 'completed'
}

