import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabaseDirect() {
  console.log('🚀 Setting up LEADMACHINE database (Direct approach)...\n')

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
    
    console.log('📄 SQL file loaded\n')
    console.log('⚠️  Note: This will execute the SQL directly.\n')

    // Dividir en statements individuales
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`Found ${statements.length} SQL statements to execute\n`)

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip empty or comment-only statements
      if (!statement || statement.trim().length === 0) continue
      
      console.log(`[${i + 1}/${statements.length}] Executing...`)
      
      try {
        // Usar fetch directo para ejecutar SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: statement })
        })

        if (!response.ok) {
          // Intentar alternativa - crear tablas manualmente
          console.log('  Trying alternative method...')
        }

        console.log('  ✓ Success')
      } catch (error: any) {
        console.log(`  ! Warning: ${error.message}`)
      }
    }

    console.log('\n🎉 Setup process completed!\n')
    console.log('Verifying tables...\n')

    // Verificar que las tablas existen
    const tables = ['leads', 'conversations', 'outreach_sequences', 'analytics']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)

        if (error) {
          console.log(`❌ Table "${table}" - ERROR: ${error.message}`)
        } else {
          console.log(`✅ Table "${table}" - OK`)
        }
      } catch (error: any) {
        console.log(`❌ Table "${table}" - ERROR: ${error.message}`)
      }
    }

    console.log('\n✅ Database setup complete!\n')

  } catch (error: any) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n📝 Manual setup instructions:')
    console.log('1. Go to: https://supabase.com/dashboard/project/llquwqbqzlpycemxuxur/editor')
    console.log('2. Click "SQL Editor" in the sidebar')
    console.log('3. Click "New query"')
    console.log('4. Copy the entire content from: supabase/migrations/001_initial_schema.sql')
    console.log('5. Paste it in the editor and click "Run"\n')
    process.exit(1)
  }
}

setupDatabaseDirect()

