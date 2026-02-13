#!/usr/bin/env node
/**
 * PostgreSQL Schema Extractor
 * Extracts tables, columns, relationships, and constraints from a PostgreSQL database.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection - update these or use environment variables
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'scorecast',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || ''
};

async function getTables(client) {
  const result = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  return result.rows.map(row => row.table_name);
}

async function getColumns(client, tableName) {
  const result = await client.query(`
    SELECT 
      column_name,
      data_type,
      character_maximum_length,
      numeric_precision,
      numeric_scale,
      is_nullable,
      column_default,
      is_generated,
      generation_expression
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = $1
    ORDER BY ordinal_position;
  `, [tableName]);
  return result.rows;
}

async function getPrimaryKeys(client, tableName) {
  const result = await client.query(`
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = $1
    ORDER BY kcu.ordinal_position;
  `, [tableName]);
  return result.rows.map(row => row.column_name);
}

async function getForeignKeys(client) {
  const result = await client.query(`
    SELECT
      tc.table_name AS from_table,
      kcu.column_name AS from_column,
      ccu.table_name AS to_table,
      ccu.column_name AS to_column,
      tc.constraint_name,
      rc.update_rule,
      rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
      AND tc.table_schema = rc.constraint_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `);
  return result.rows;
}

async function getUniqueConstraints(client, tableName) {
  const result = await client.query(`
    SELECT 
      tc.constraint_name,
      array_agg(kcu.column_name ORDER BY kcu.ordinal_position) AS columns
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = 'public'
      AND tc.table_name = $1
    GROUP BY tc.constraint_name;
  `, [tableName]);
  return result.rows;
}

async function getCheckConstraints(client, tableName) {
  const result = await client.query(`
    SELECT 
      cc.constraint_name,
      cc.check_clause
    FROM information_schema.check_constraints cc
    JOIN information_schema.table_constraints tc
      ON cc.constraint_name = tc.constraint_name
      AND cc.constraint_schema = tc.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = $1
      AND tc.constraint_type = 'CHECK';
  `, [tableName]);
  return result.rows;
}

async function getIndexes(client, tableName) {
  const result = await client.query(`
    SELECT
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = $1;
  `, [tableName]);
  return result.rows;
}

async function getEnums(client) {
  const result = await client.query(`
    SELECT 
      t.typname AS enum_name,
      array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname;
  `);
  return result.rows;
}

async function getRowCounts(client, tables) {
  const counts = {};
  for (const table of tables) {
    const result = await client.query(`
      SELECT reltuples::bigint AS estimate
      FROM pg_class
      WHERE relname = $1;
    `, [table]);
    counts[table] = result.rows[0]?.estimate || 0;
  }
  return counts;
}

function formatDataType(col) {
  const dtype = col.data_type;
  if (dtype === 'character varying') {
    return col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : 'VARCHAR';
  } else if (dtype === 'numeric') {
    if (col.numeric_precision && col.numeric_scale) {
      return `DECIMAL(${col.numeric_precision},${col.numeric_scale})`;
    }
    return 'DECIMAL';
  } else if (dtype === 'ARRAY') {
    return 'TEXT[]';
  }
  return dtype.toUpperCase();
}

async function extractSchema() {
  console.log('='.repeat(60));
  console.log('PostgreSQL Schema Extractor');
  console.log('='.repeat(60));
  console.log(`\nConnecting to: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);

  const client = new Client(DB_CONFIG);

  try {
    await client.connect();
    console.log('✓ Connected successfully!\n');
  } catch (err) {
    console.error(`✗ Connection failed: ${err.message}`);
    console.log('\nUpdate DB_CONFIG in the script or set environment variables:');
    console.log('  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    return null;
  }

  const schema = {
    extracted_at: new Date().toISOString(),
    database: DB_CONFIG.database,
    enums: {},
    tables: {},
    relationships: []
  };

  // Get custom enums
  console.log('Extracting custom types...');
  const enums = await getEnums(client);
  for (const e of enums) {
    schema.enums[e.enum_name] = e.values;
  }

  // Get tables
  const tables = await getTables(client);
  console.log(`Found ${tables.length} tables\n`);

  // Get row counts
  const rowCounts = await getRowCounts(client, tables);

  // Extract each table's structure
  for (const table of tables) {
    console.log(`  Processing: ${table}`);

    const columns = await getColumns(client, table);
    const pk = await getPrimaryKeys(client, table);
    const unique = await getUniqueConstraints(client, table);
    const checks = await getCheckConstraints(client, table);
    const indexes = await getIndexes(client, table);

    schema.tables[table] = {
      row_count: rowCounts[table] || 0,
      primary_key: pk,
      columns: {},
      unique_constraints: [],
      check_constraints: [],
      indexes: []
    };

    for (const col of columns) {
      schema.tables[table].columns[col.column_name] = {
        type: formatDataType(col),
        nullable: col.is_nullable === 'YES',
        default: col.column_default,
        generated: col.is_generated === 'ALWAYS'
      };
    }

    for (const u of unique) {
      schema.tables[table].unique_constraints.push({
        name: u.constraint_name,
        columns: u.columns
      });
    }

    for (const c of checks) {
      schema.tables[table].check_constraints.push({
        name: c.constraint_name,
        expression: c.check_clause
      });
    }

    for (const idx of indexes) {
      schema.tables[table].indexes.push({
        name: idx.indexname,
        definition: idx.indexdef
      });
    }
  }

  // Get foreign keys
  console.log('\nExtracting relationships...');
  const fks = await getForeignKeys(client);
  for (const fk of fks) {
    schema.relationships.push({
      name: fk.constraint_name,
      from_table: fk.from_table,
      from_column: fk.from_column,
      to_table: fk.to_table,
      to_column: fk.to_column,
      on_update: fk.update_rule,
      on_delete: fk.delete_rule
    });
  }

  await client.end();
  return schema;
}

function printSchemaSummary(schema) {
  console.log('\n' + '='.repeat(60));
  console.log('DATABASE SCHEMA SUMMARY');
  console.log('='.repeat(60));

  // Enums
  if (Object.keys(schema.enums).length > 0) {
    console.log('\n## Custom Types (Enums)');
    for (const [name, values] of Object.entries(schema.enums)) {
      console.log(`  • ${name}: ${values.join(', ')}`);
    }
  }

  // Tables
  console.log(`\n## Tables (${Object.keys(schema.tables).length})`);
  for (const [tableName, tableInfo] of Object.entries(schema.tables)) {
    const pkStr = tableInfo.primary_key.length > 0 ? ` [PK: ${tableInfo.primary_key.join(', ')}]` : '';
    const rowStr = tableInfo.row_count > 0 ? ` (~${tableInfo.row_count.toLocaleString()} rows)` : '';
    console.log(`\n### ${tableName}${pkStr}${rowStr}`);

    for (const [colName, colInfo] of Object.entries(tableInfo.columns)) {
      const nullable = colInfo.nullable ? '' : ' NOT NULL';
      const generated = colInfo.generated ? ' [GENERATED]' : '';
      let defaultStr = '';
      if (colInfo.default) {
        const defVal = String(colInfo.default);
        defaultStr = defVal.length > 30 ? ` DEFAULT ${defVal.slice(0, 30)}...` : ` DEFAULT ${defVal}`;
      }
      console.log(`    ${colName}: ${colInfo.type}${nullable}${defaultStr}${generated}`);
    }
  }

  // Relationships
  console.log(`\n## Relationships (${schema.relationships.length})`);
  for (const rel of schema.relationships) {
    console.log(`  • ${rel.from_table}.${rel.from_column} → ${rel.to_table}.${rel.to_column}`);
    console.log(`    (ON DELETE ${rel.on_delete}, ON UPDATE ${rel.on_update})`);
  }
}

function saveSchema(schema, outputDir = '.') {
  // Save JSON
  const jsonPath = path.join(outputDir, 'schema.json');
  fs.writeFileSync(jsonPath, JSON.stringify(schema, null, 2));
  console.log(`\n✓ Saved JSON schema to: ${jsonPath}`);

  // Save Markdown
  const mdPath = path.join(outputDir, 'schema.md');
  let md = `# Database Schema\n\n`;
  md += `*Extracted: ${schema.extracted_at}*\n\n`;

  // Enums
  if (Object.keys(schema.enums).length > 0) {
    md += `## Custom Types\n\n`;
    for (const [name, values] of Object.entries(schema.enums)) {
      md += `**${name}**: \`${values.join(', ')}\`\n\n`;
    }
  }

  // Tables
  md += `## Tables\n\n`;
  for (const [tableName, tableInfo] of Object.entries(schema.tables)) {
    const pk = tableInfo.primary_key.length > 0 ? `Primary Key: \`${tableInfo.primary_key.join(', ')}\`` : '';
    md += `### ${tableName}\n\n`;
    if (pk) md += `${pk}\n\n`;

    md += `| Column | Type | Nullable | Default |\n`;
    md += `|--------|------|----------|--------|\n`;
    for (const [colName, colInfo] of Object.entries(tableInfo.columns)) {
      const nullable = colInfo.nullable ? 'YES' : 'NO';
      let defaultVal = colInfo.default || '-';
      if (String(defaultVal).length > 25) {
        defaultVal = String(defaultVal).slice(0, 22) + '...';
      }
      md += `| ${colName} | ${colInfo.type} | ${nullable} | ${defaultVal} |\n`;
    }
    md += '\n';
  }

  // Relationships
  md += `## Relationships\n\n`;
  md += `| From | To | On Delete |\n`;
  md += `|------|----|-----------|\n`;
  for (const rel of schema.relationships) {
    md += `| ${rel.from_table}.${rel.from_column} | ${rel.to_table}.${rel.to_column} | ${rel.on_delete} |\n`;
  }

  fs.writeFileSync(mdPath, md);
  console.log(`✓ Saved Markdown schema to: ${mdPath}`);

  return { jsonPath, mdPath };
}

async function main() {
  const schema = await extractSchema();

  if (schema) {
    printSchemaSummary(schema);
    const { jsonPath, mdPath } = saveSchema(schema);

    console.log('\n' + '='.repeat(60));
    console.log('Done! Files saved:');
    console.log(`  • ${jsonPath}`);
    console.log(`  • ${mdPath}`);
    console.log('='.repeat(60));
  }
}

main().catch(console.error);