import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data from the database!\n')
  
  // Wait 3 seconds to allow cancellation
  console.log('Starting in 3 seconds... Press Ctrl+C to cancel')
  await new Promise(resolve => setTimeout(resolve, 3000))

  try {
    console.log('\n🗑️  Deleting all data...\n')

    // Delete in order (respecting foreign keys)
    const { error: conversationsError } = await supabase
      .from('conversations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (conversationsError) {
      console.error('Error deleting conversations:', conversationsError)
    } else {
      console.log('✓ Conversations deleted')
    }

    const { error: outreachError } = await supabase
      .from('outreach_sequences')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (outreachError) {
      console.error('Error deleting outreach_sequences:', outreachError)
    } else {
      console.log('✓ Outreach sequences deleted')
    }

    const { error: leadsError } = await supabase
      .from('leads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (leadsError) {
      console.error('Error deleting leads:', leadsError)
    } else {
      console.log('✓ Leads deleted')
    }

    const { error: analyticsError } = await supabase
      .from('analytics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (analyticsError) {
      console.error('Error deleting analytics:', analyticsError)
    } else {
      console.log('✓ Analytics deleted')
    }

    console.log('\n✅ Database reset complete!\n')

  } catch (error) {
    console.error('❌ Reset failed:', error)
    process.exit(1)
  }
}

resetDatabase()


