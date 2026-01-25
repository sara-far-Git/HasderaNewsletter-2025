#!/usr/bin/env node
/**
 * Script to run CreateSectionsTables.sql on PostgreSQL database
 */
const fs = require('fs');
const path = require('path');

// Try to use pg (PostgreSQL client for Node.js)
let pg;
try {
  pg = require('pg');
} catch (e) {
  console.error('❌ pg לא מותקן. התקיני עם:');
  console.error('   npm install pg');
  process.exit(1);
}

const { Client } = pg;

// Database connection details from appsettings.json
const dbConfig = {
  host: 'hasdera-before-move-va.cglio20u6t3o.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'hasdera',
  user: 'Hasdera',
  password: 'Hasdera2025!',
  ssl: {
    rejectUnauthorized: false
  }
};

async function runSqlFile(filePath) {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 מתחבר לדאטאבייס...');
    await client.connect();
    console.log('✅ התחברות הצליחה!');
    
    console.log('📝 קורא את קובץ ה-SQL...');
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('📝 מריץ את ה-SQL...');
    await client.query(sqlContent);
    
    console.log('✅ ה-SQL הורץ בהצלחה!');
    console.log('\n📊 הטבלאות נוצרו:');
    console.log('   - sections');
    console.log('   - section_contents');
    console.log('   - content_comments');
    console.log('   - content_likes');
    console.log('\n🎉 המדורים הראשוניים נוספו!');
    
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
    if (error.code) {
      console.error(`   קוד שגיאה: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Main
const scriptDir = __dirname;
const sqlFile = path.join(scriptDir, 'CreateSectionsTables.sql');

if (!fs.existsSync(sqlFile)) {
  console.error(`❌ הקובץ ${sqlFile} לא נמצא!`);
  process.exit(1);
}

runSqlFile(sqlFile);

