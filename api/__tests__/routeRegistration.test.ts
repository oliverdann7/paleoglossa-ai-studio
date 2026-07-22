import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Every router module in api/_routes must be imported AND mounted in api/index.ts.
// account.ts once shipped unmounted, silently 404ing account deletion — this
// guards against the next forgotten app.use().
const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexSource = fs.readFileSync(path.join(apiDir, 'index.ts'), 'utf8');
const routeModules = fs
  .readdirSync(path.join(apiDir, '_routes'))
  .filter((f) => f.endsWith('.ts'))
  .map((f) => f.replace(/\.ts$/, ''));

describe('api route registration', () => {
  it('finds route modules', () => {
    expect(routeModules.length).toBeGreaterThan(20);
  });

  it.each(routeModules)('%s is imported and mounted in api/index.ts', (name) => {
    const importMatch = indexSource.match(
      new RegExp(`import\\s+(\\w+)\\s+from\\s+'\\./_routes/${name}\\.js'`)
    );
    expect(importMatch, `missing import for _routes/${name}.ts`).toBeTruthy();
    const routerName = importMatch![1];
    expect(
      indexSource.includes(`app.use(${routerName})`),
      `missing app.use(${routerName}) for _routes/${name}.ts`
    ).toBe(true);
  });
});
