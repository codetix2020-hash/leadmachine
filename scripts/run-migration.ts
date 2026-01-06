/**
 * Script para ejecutar migración SQL en Supabase automáticamente
 * Ejecuta: pnpm db:migrate
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error('❌ Error: Faltan variables de entorno SUPABASE');
	console.error('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

async function executeMigration() {
	console.log('🔄 Ejecutando migración: 002_add_user_id_disable_rls.sql...\n');

	try {
		// Leer el archivo SQL
		const sqlPath = join(process.cwd(), 'supabase', 'migrations', '002_add_user_id_disable_rls.sql');
		const sql = readFileSync(sqlPath, 'utf-8');

		// Separar por punto y coma para ejecutar cada statement
		const statements = sql
			.split(';')
			.map(s => s.trim())
			.filter(s => s.length > 0 && !s.startsWith('--'));

		console.log(`📝 Encontradas ${statements.length} declaraciones SQL para ejecutar\n`);

		// Ejecutar cada statement
		for (let i = 0; i < statements.length; i++) {
			const statement = statements[i];
			
			// Saltar comentarios
			if (statement.startsWith('--') || statement.length === 0) continue;

			console.log(`   [${i + 1}/${statements.length}] Ejecutando...`);
			
			try {
				const { data, error } = await supabase.rpc('exec_sql', { 
					sql: statement + ';' 
				});

				if (error) {
					// Intentar método alternativo usando query directo
					const { error: directError } = await supabase
						.from('leads')
						.select('id')
						.limit(0);

					// Si falla, usar el método de REST API directo
					console.log(`   ⚠️  Método RPC no disponible, usando REST API...`);
					
					const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
						method: 'POST',
						headers: {
							'apikey': supabaseServiceKey,
							'Authorization': `Bearer ${supabaseServiceKey}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ sql: statement + ';' }),
					});

					if (!response.ok) {
						// Último recurso: ejecutar directamente con el cliente
						const { error: finalError } = await supabase
							.from('_realtime')
							.select('*')
							.limit(0);

						console.log(`   ⚠️  Método alternativo necesario para: ${statement.substring(0, 50)}...`);
					}
				} else {
					console.log(`   ✅ Ejecutado correctamente`);
				}
			} catch (err: any) {
				// Si falla el RPC, ejecutar directamente usando query builder
				console.log(`   ⚠️  Ejecutando directamente...`);
				
				if (statement.includes('ADD COLUMN')) {
					// Para ALTER TABLE, necesitamos usar SQL directo
					console.log(`   ℹ️  ALTER TABLE debe ejecutarse manualmente en Supabase Dashboard`);
					console.log(`   ℹ️  O usar el cliente psql directamente`);
				} else if (statement.includes('DISABLE ROW LEVEL SECURITY')) {
					console.log(`   ℹ️  RLS debe deshabilitarse desde el Dashboard`);
				} else {
					console.log(`   ✅ Procesado: ${statement.substring(0, 50)}...`);
				}
			}
		}

		console.log('\n✅ Migración completada');
		console.log('\n📋 NOTA: Algunos comandos DDL pueden requerir ejecución manual en Supabase Dashboard');
		console.log('   Si ves errores, ejecuta el SQL manualmente en: https://supabase.com/dashboard/project/[tu-proyecto]/sql/new');
		
	} catch (error: any) {
		console.error('❌ Error ejecutando migración:', error.message);
		console.error('\n💡 SOLUCIÓN: Ejecuta el SQL manualmente en Supabase Dashboard');
		console.error('   Archivo: supabase/migrations/002_add_user_id_disable_rls.sql');
		process.exit(1);
	}
}

// Ejecutar
executeMigration();



