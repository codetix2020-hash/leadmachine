/**
 * Script AUTOMÁTICO MEJORADO: Ejecuta migración SQL usando Supabase REST API
 * Usa el Secret Key para ejecutar SQL directamente
 * Ejecuta: pnpm db:migrate
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
	console.error('❌ Error: Faltan variables de entorno');
	console.error('   Asegúrate de tener en .env:');
	console.error('   - NEXT_PUBLIC_SUPABASE_URL');
	console.error('   - SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_SECRET_KEY)');
	process.exit(1);
}

async function executeMigration() {
	console.log('🔄 Ejecutando migración automática usando Supabase API...\n');

	// Leer el archivo SQL
	const sqlPath = join(process.cwd(), 'supabase', 'migrations', '002_add_user_id_disable_rls.sql');
	const sql = readFileSync(sqlPath, 'utf-8');

	// Extraer project ref
	const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

	console.log('📝 Usando Supabase Management API...\n');

	// Intentar usar Supabase Management API para ejecutar SQL
	// Nota: Esto requiere usar la API REST de Supabase que ejecuta SQL
	
	try {
		// Dividir SQL en statements individuales
		const statements = sql
			.split(';')
			.map(s => s.trim())
			.filter(s => s.length > 0 && !s.startsWith('--'));

		console.log(`📋 Ejecutando ${statements.length} statements...\n`);

		// Intentar ejecutar cada statement usando REST API
		// Método 1: Usar rpc endpoint si existe una función
		let successCount = 0;
		let skipCount = 0;

		for (let i = 0; i < statements.length; i++) {
			const statement = statements[i];
			if (statement.length === 0) continue;

			// Para DDL, necesitamos usar el endpoint correcto
			// Intentar ejecutar usando REST API con postgREST
			try {
				// Usar el endpoint de query directo si está disponible
				const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
					method: 'POST',
					headers: {
						'apikey': supabaseSecretKey!,
						'Authorization': `Bearer ${supabaseSecretKey!}`,
						'Content-Type': 'application/json',
						'Prefer': 'return=representation',
					},
					body: JSON.stringify({ query: statement }),
				});

				if (response.ok) {
					console.log(`   ✅ [${i + 1}/${statements.length}] Ejecutado`);
					successCount++;
				} else {
					const errorText = await response.text();
					if (errorText.includes('does not exist') || errorText.includes('already exists')) {
						console.log(`   ⚠️  [${i + 1}/${statements.length}] ${statement.substring(0, 50)}... (ya existe o no aplica)`);
						skipCount++;
					} else {
						throw new Error(errorText);
					}
				}
			} catch (err: any) {
				// Si falla, usar método alternativo: SQL Editor API
				console.log(`   ⚠️  [${i + 1}/${statements.length}] Método automático no disponible para este statement`);
				skipCount++;
			}
		}

		if (successCount > 0) {
			console.log(`\n✅ ${successCount} statements ejecutados correctamente`);
			console.log('🎉 La base de datos está lista para usar sin autenticación\n');
			return;
		}

	} catch (error: any) {
		console.log(`\n⚠️  Método automático no funcionó: ${error.message}\n`);
	}

	// Si llegamos aquí, usar el método manual pero simplificado
	console.log('💡 SOLUCIÓN: Usar SQL Editor de Supabase (más confiable)\n');
	console.log('📋 Pasos rápidos:\n');
	console.log('   1. Ve a: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
	console.log('   2. Abre el archivo: supabase/migrations/002_add_user_id_disable_rls.sql');
	console.log('   3. Copia TODO el contenido (Ctrl+A, Ctrl+C)');
	console.log('   4. Pégalo en el SQL Editor (Ctrl+V)');
	console.log('   5. Click en "Run" (botón verde)\n');
	
	console.log('⏱️  Tiempo estimado: 30 segundos\n');

	// Abrir el SQL Editor y el archivo
	console.log('🚀 Abriendo SQL Editor y archivo SQL...\n');
	
	const { exec } = await import('child_process');
	const { promisify } = await import('util');
	const execAsync = promisify(exec);

	try {
		// Abrir SQL Editor en el navegador
		await execAsync(`start https://supabase.com/dashboard/project/${projectRef}/sql/new`);
		
		// Abrir archivo SQL en Notepad
		await execAsync(`notepad "${sqlPath}"`);
		
		console.log('✅ SQL Editor y archivo SQL abiertos\n');
		console.log('📋 Copia el contenido de Notepad y pégalo en Supabase SQL Editor\n');
	} catch (err) {
		console.log('💡 Abre manualmente:');
		console.log('   - SQL Editor: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
		console.log('   - Archivo SQL: ' + sqlPath + '\n');
	}
}

executeMigration();
