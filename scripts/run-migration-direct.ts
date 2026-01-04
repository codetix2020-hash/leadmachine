/**
 * Script AUTOMÁTICO MEJORADO: Ejecuta migración SQL en Supabase
 * Intenta múltiples métodos automáticamente
 * Ejecuta: pnpm db:migrate
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error('❌ Error: Faltan variables de entorno');
	console.error('   Asegúrate de tener en .env:');
	console.error('   - NEXT_PUBLIC_SUPABASE_URL');
	console.error('   - SUPABASE_SERVICE_ROLE_KEY');
	process.exit(1);
}

async function executeMigration() {
	console.log('🔄 Ejecutando migración automática en Supabase...\n');

	// Leer el archivo SQL
	const sqlPath = join(process.cwd(), 'supabase', 'migrations', '002_add_user_id_disable_rls.sql');
	const sql = readFileSync(sqlPath, 'utf-8');

	// Método 1: Intentar con pg si DATABASE_URL está disponible
	if (databaseUrl) {
		try {
			console.log('📡 Método 1: Usando conexión directa a PostgreSQL...\n');
			const { Client } = await import('pg');
			
			const client = new Client({
				connectionString: databaseUrl,
				ssl: { rejectUnauthorized: false },
			});

			await client.connect();
			console.log('✅ Conectado a PostgreSQL\n');

			const statements = sql
				.split(';')
				.map(s => s.trim())
				.filter(s => s.length > 0 && !s.startsWith('--'));

			for (let i = 0; i < statements.length; i++) {
				const statement = statements[i];
				if (statement.length === 0) continue;

				try {
					await client.query(statement + ';');
					console.log(`   ✅ [${i + 1}/${statements.length}] Ejecutado`);
				} catch (err: any) {
					if (err.message.includes('already exists') || 
						err.message.includes('does not exist') ||
						err.message.includes('IF EXISTS')) {
						console.log(`   ⚠️  [${i + 1}/${statements.length}] ${err.message.split('\n')[0].substring(0, 60)}`);
					} else {
						throw err;
					}
				}
			}

			await client.end();
			console.log('\n✅ Migración ejecutada correctamente!\n');
			console.log('🎉 La base de datos está lista para usar sin autenticación\n');
			return;

		} catch (error: any) {
			console.log(`\n⚠️  Método 1 falló: ${error.message}\n`);
			console.log('🔄 Intentando método alternativo...\n');
		}
	}

	// Método 2: Usar Supabase JS Client para ejecutar statements individuales
	console.log('📡 Método 2: Usando Supabase Client...\n');
	const supabase = createClient(supabaseUrl, supabaseServiceKey);

	// Ejecutar statements que podemos hacer con el cliente
	const statements = sql
		.split(';')
		.map(s => s.trim())
		.filter(s => s.length > 0 && !s.startsWith('--'));

	console.log('💡 Ejecutando statements compatibles...\n');

	// Solo podemos ejecutar queries de datos, no DDL directamente
	// Así que vamos a abrir el SQL y dar instrucciones claras
	
	console.log('⚠️  La ejecución directa de DDL requiere DATABASE_URL\n');
	console.log('💡 CONFIGURACIÓN RÁPIDA (30 segundos):\n');
	console.log('   1. Ve a Supabase Dashboard > Settings > Database');
	console.log('   2. En "Connection string" copia la URI');
	console.log('   3. Agrégala a .env como:\n');
	console.log('      DATABASE_URL=postgresql://postgres:[TU_PASSWORD]@db.llquwqbqzlpycemxuxur.supabase.co:5432/postgres\n');
	console.log('   4. Vuelve a ejecutar: pnpm db:migrate\n');
	
	console.log('📋 O ejecuta el SQL manualmente:\n');
	console.log('   URL: https://supabase.com/dashboard/project/llquwqbqzlpycemxuxur/sql/new\n');
	
	// Abrir el archivo SQL
	console.log('📄 Abriendo archivo SQL para copiar...\n');
	const { exec } = await import('child_process');
	const { promisify } = await import('util');
	const execAsync = promisify(exec);
	
	try {
		await execAsync(`notepad "${sqlPath}"`);
	} catch {
		// Ignorar errores al abrir notepad
	}
}

executeMigration();
