import { pgPool } from '../database';
import { TABLES } from '../database/table_name';

async function clearTable(tableName: string) {
  console.log(`Clearing data from table: ${tableName}`);
  try {
    await pgPool.query(`DELETE FROM ${tableName}`);
    console.log(`✓ Cleared data from ${tableName}`);
  } catch (error) {
    console.error(`❌ Failed to clear ${tableName}:`, error);
    throw error;
  }
}

async function resetSequences(tableNames: string[]) {
  console.log('Resetting sequences...');
  
  // Reset sequences for tables that might have them
  for (const table of tableNames) {
    try {
      // Try different sequence reset approaches
      await pgPool.query(`ALTER SEQUENCE IF EXISTS ${table}_id_seq RESTART WITH 1`);
      console.log(`✓ Reset sequence for ${table}`);
    } catch (err) {
      // Try the setval approach as fallback
      try {
        await pgPool.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), 1, false);`);
        console.log(`✓ Reset sequence for ${table} (fallback method)`);
      } catch (fallbackErr) {
        console.log(`- No sequence to reset for ${table}`);
      }
    }
  }
  
  console.log('✓ Sequence reset completed');
}

async function clearSpecificTables(tableNames: string[]) {
  console.log(`Clearing data from specific tables: ${tableNames.join(', ')}`);
  
  try {
    await pgPool.query('BEGIN');

    // Clear data from specified tables
    for (const table of tableNames) {
      await clearTable(table);
    }

    // Reset sequences for specified tables
    await resetSequences(tableNames);

    await pgPool.query('COMMIT');
    console.log('✅ Specified tables cleared successfully!');
    
  } catch (error) {
    await pgPool.query('ROLLBACK');
    console.error('❌ Error clearing tables:', error);
    throw error;
  }
}

async function clearAllData() {
  // Get all table names from TABLES constant
  const allTables = Object.values(TABLES);
  
  // Add schema_migrations table for complete cleanup
  const tables = [
    ...allTables,
    'schema_migrations'
  ];

  console.log('Starting complete data cleanup...');
  console.log(`Tables to clear: ${tables.join(', ')}`);
  
  try {
    await pgPool.query('BEGIN');

    // Clear data from all tables
    for (const table of tables) {
      await clearTable(table);
    }

    // Reset sequences
    await resetSequences(allTables);

    await pgPool.query('COMMIT');
    console.log('✅ All data cleared successfully!');
    
  } catch (error) {
    await pgPool.query('ROLLBACK');
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

function printUsage() {
  const availableTables = [...Object.values(TABLES), 'schema_migrations'];
  
  console.log(`
Usage:
  npm run clear:data                    # Clear all tables
  npm run clear:data ${availableTables[0]}             # Clear specific table
  npm run clear:data ${availableTables[0]} ${availableTables[1]}      # Clear multiple tables

Available tables:
${availableTables.map(table => `  - ${table}`).join('\n')}

Examples:
${availableTables.slice(0, 3).map(table => `  npm run clear:data ${table}`).join('\n')}
  npm run clear:data ${availableTables[0]} ${availableTables[1]}
  npm run clear:data schema_migrations
`);
}

async function main() {
  const args = process.argv.slice(2); // Get command line arguments
  
  try {
    if (args.length === 0) {
      // No arguments provided, clear all data
      await clearAllData();
      console.log('\n🎉 All database data cleared!');
    } else {
      // Specific tables provided
      const validTables = [...Object.values(TABLES), 'schema_migrations'];
      const requestedTables = args;
      
      // Validate table names
      const invalidTables = requestedTables.filter(table => !validTables.includes(table));
      if (invalidTables.length > 0) {
        console.error(`❌ Invalid table names: ${invalidTables.join(', ')}`);
        printUsage();
        process.exit(1);
      }
      
      await clearSpecificTables(requestedTables);
      console.log(`\n🎉 Cleared data from: ${requestedTables.join(', ')}`);
    }
    
    console.log('💡 You can now run \`npm run migrate:dev\` to recreate tables if needed.');
    
  } catch (error) {
    console.error('💥 Failed to clear data:', error);
    process.exit(1);
  } finally {
    // Always close the connection pool
    try {
      await pgPool.end();
    } catch (endError) {
      console.error('Error closing database connection:', endError);
    }
  }
}

main().catch(async (err) => {
  console.error(err);
  try {
    await pgPool.end();
  } catch {
    // ignore
  }
  process.exit(1);
});
