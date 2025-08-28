#!/usr/bin/env node

/**
 * Script per analizzare il bundle JavaScript
 * Uso: node analyze-bundle.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analizzando il bundle JavaScript...\n');

try {
  // Build con analisi del bundle
  console.log('📦 Eseguendo build con analisi...');
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Analisi completata!');
  console.log('📊 Controlla il file .next/analyze/ per i dettagli del bundle');
  
  // Suggerimenti per ottimizzazioni
  console.log('\n💡 Suggerimenti per ridurre il bundle:');
  console.log('1. Usa dynamic imports per componenti pesanti');
  console.log('2. Implementa code splitting per route');
  console.log('3. Ottimizza le importazioni delle librerie');
  console.log('4. Usa tree shaking per rimuovere codice inutilizzato');
  console.log('5. Considera l\'uso di bundle analyzer per identificare chunk pesanti');
  
} catch (error) {
  console.error('❌ Errore durante l\'analisi:', error.message);
  process.exit(1);
}
