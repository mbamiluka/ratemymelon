#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Run this script to validate your environment setup before deployment
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(rootDir, 'server', '.env') });

console.log('🔍 RateMyMelon Environment Validation\n');

// Required environment variables
const requiredVars = [
  {
    name: 'MONGODB_URI',
    description: 'MongoDB connection string',
    example: 'mongodb+srv://user:pass@cluster.mongodb.net/db'
  },
  {
    name: 'CLOUDINARY_CLOUD_NAME',
    description: 'Cloudinary cloud name',
    example: 'your-cloud-name'
  },
  {
    name: 'CLOUDINARY_API_KEY',
    description: 'Cloudinary API key',
    example: '123456789012345'
  },
  {
    name: 'CLOUDINARY_API_SECRET',
    description: 'Cloudinary API secret',
    example: 'your-api-secret'
  }
];

// Optional but recommended variables
const optionalVars = [
  {
    name: 'NODE_ENV',
    description: 'Environment mode',
    example: 'production',
    default: 'development'
  },
  {
    name: 'PORT',
    description: 'Server port',
    example: '3001',
    default: '3001'
  },
  {
    name: 'JWT_SECRET',
    description: 'JWT signing secret',
    example: 'your-super-secret-key',
    default: 'random-secret'
  },
  {
    name: 'CORS_ORIGIN',
    description: 'CORS allowed origins',
    example: 'https://your-domain.com',
    default: '*'
  }
];

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('📋 Required Environment Variables:');
console.log('=====================================');

requiredVars.forEach(variable => {
  const value = process.env[variable.name];
  
  if (!value) {
    console.log(`❌ ${variable.name}`);
    console.log(`   Description: ${variable.description}`);
    console.log(`   Example: ${variable.example}\n`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const maskedValue = variable.name.toLowerCase().includes('secret') || 
                       variable.name.toLowerCase().includes('password') ||
                       variable.name.toLowerCase().includes('key')
      ? '*'.repeat(Math.min(value.length, 8))
      : value.length > 50 ? value.substring(0, 47) + '...' : value;
    
    console.log(`✅ ${variable.name}: ${maskedValue}`);
  }
});

console.log('\n📋 Optional Environment Variables:');
console.log('===================================');

optionalVars.forEach(variable => {
  const value = process.env[variable.name];
  
  if (!value) {
    console.log(`⚠️  ${variable.name} (using default: ${variable.default})`);
    console.log(`   Description: ${variable.description}`);
    console.log(`   Example: ${variable.example}\n`);
    hasWarnings = true;
  } else {
    // Mask sensitive values
    const maskedValue = variable.name.toLowerCase().includes('secret') || 
                       variable.name.toLowerCase().includes('password')
      ? '*'.repeat(Math.min(value.length, 8))
      : value;
    
    console.log(`✅ ${variable.name}: ${maskedValue}`);
  }
});

// Check file structure
console.log('\n📁 File Structure Check:');
console.log('========================');

const requiredFiles = [
  { path: 'server/.env.example', description: 'Backend environment template' },
  { path: '.env.example', description: 'Frontend environment template' },
  { path: 'package.json', description: 'Frontend package configuration' },
  { path: 'server/package.json', description: 'Backend package configuration' },
  { path: 'render.yaml', description: 'Render deployment configuration' }
];

requiredFiles.forEach(file => {
  const fullPath = join(rootDir, file.path);
  if (existsSync(fullPath)) {
    console.log(`✅ ${file.path}`);
  } else {
    console.log(`❌ ${file.path} - ${file.description}`);
    hasErrors = true;
  }
});

// Environment-specific checks
console.log('\n🔧 Environment-Specific Checks:');
console.log('===============================');

const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`Environment: ${nodeEnv}`);

if (nodeEnv === 'production') {
  // Production-specific checks
  const productionChecks = [
    {
      check: () => process.env.JWT_SECRET && process.env.JWT_SECRET !== 'random-secret',
      message: 'JWT_SECRET should be a strong, unique secret in production'
    },
    {
      check: () => process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*',
      message: 'CORS_ORIGIN should be restricted to your domain in production'
    },
    {
      check: () => process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv://'),
      message: 'Consider using MongoDB Atlas (mongodb+srv://) for production'
    }
  ];

  productionChecks.forEach(({ check, message }) => {
    if (check()) {
      console.log(`✅ ${message}`);
    } else {
      console.log(`⚠️  ${message}`);
      hasWarnings = true;
    }
  });
} else {
  console.log('ℹ️  Development environment - some security checks skipped');
}

// Connection tests (basic validation)
console.log('\n🔗 Basic Validation Tests:');
console.log('==========================');

// MongoDB URI format check
if (process.env.MONGODB_URI) {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')) {
    console.log('✅ MongoDB URI format appears valid');
  } else {
    console.log('❌ MongoDB URI format appears invalid');
    hasErrors = true;
  }
} else {
  console.log('⏭️  Skipping MongoDB URI validation (not set)');
}

// Cloudinary configuration check
const cloudinaryVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const cloudinarySet = cloudinaryVars.filter(varName => process.env[varName]);

if (cloudinarySet.length === 3) {
  console.log('✅ All Cloudinary variables are set');
} else if (cloudinarySet.length > 0) {
  console.log(`⚠️  Only ${cloudinarySet.length}/3 Cloudinary variables are set`);
  console.log(`   Missing: ${cloudinaryVars.filter(v => !process.env[v]).join(', ')}`);
  hasWarnings = true;
} else {
  console.log('⏭️  Skipping Cloudinary validation (not configured)');
}

// Summary
console.log('\n📊 Validation Summary:');
console.log('======================');

if (hasErrors) {
  console.log('❌ Validation failed! Please fix the errors above before proceeding.');
  console.log('\n💡 Quick fixes:');
  console.log('   1. Copy server/.env.example to server/.env');
  console.log('   2. Fill in your actual API keys and database URL');
  console.log('   3. Run this script again to verify');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Validation passed with warnings. Consider addressing the warnings above.');
  console.log('✅ Your environment should work, but may not be optimally configured.');
  process.exit(0);
} else {
  console.log('✅ All checks passed! Your environment is properly configured.');
  console.log('🚀 You\'re ready to deploy RateMyMelon!');
  process.exit(0);
}