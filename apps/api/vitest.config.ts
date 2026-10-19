import { defineConfig } from 'vitest/config';

try {
  process.loadEnvFile('.env');
} catch {
  // CI provides env vars directly.
}

export default defineConfig({ test: { include: ['src/**/*.test.ts'], fileParallelism: false } });
