export interface DailyAnalytics {
  id: string
  date: string
  leads_found: number
  messages_sent: number
  open_rate: number
  response_rate: number
  calls_scheduled: number
  deals_closed: number
  revenue_generated: number
  created_at: string
}

export interface LeadSourceMetrics {
  source: string
  count: number
  conversion_rate: number
}

export interface ChannelPerformance {
  channel: 'email' | 'linkedin' | 'whatsapp' | 'instagram'
  messages_sent: number
  responses_received: number
  response_rate: number
  meetings_scheduled: number
}

export interface PipelineMetrics {
  stage: string
  count: number
  value: number
}

export interface AnalyticsSummary {
  total_leads: number
  total_contacted: number
  total_interested: number
  total_calls_scheduled: number
  total_closed: number
  total_revenue: number
  conversion_rate: number
  avg_response_time: number
}

export interface TimeSeriesData {
  date: string
  value: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

