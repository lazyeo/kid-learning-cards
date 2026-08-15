import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const projectFile = (path: string) => join(process.cwd(), path);

describe('Cloudflare Worker deployment configuration', () => {
  it('serves the SPA and compiled API routes from a staging Worker', () => {
    const wrangler = readFileSync(projectFile('wrangler.toml'), 'utf8');

    expect(wrangler).toContain('name = "kids-learning-cards-worker"');
    expect(wrangler).toContain('main = ".worker/index.js"');
    expect(wrangler).not.toContain('pages_build_output_dir');
    expect(wrangler).toContain('[assets]');
    expect(wrangler).toContain('directory = "./dist"');
    expect(wrangler).toContain('binding = "ASSETS"');
    expect(wrangler).toContain('not_found_handling = "single-page-application"');
    expect(wrangler).toContain('run_worker_first = ["/api/*"]');
    expect(wrangler).toContain('[images]');
    expect(wrangler).toContain('binding = "IMAGE_TRANSFORMER"');
    expect(wrangler).toContain('binding = "DB"');
    expect(wrangler).toContain('binding = "IMAGES"');
    expect(wrangler).toContain('binding = "AI"');
  });

  it('routes the production hostname through the Worker without deleting Pages', () => {
    const wrangler = readFileSync(projectFile('wrangler.toml'), 'utf8');

    expect(wrangler).toContain('pattern = "kids.a-dobe.club/*"');
    expect(wrangler).toContain('zone_name = "a-dobe.club"');
  });

  it('builds Pages Functions into a Worker before Wrangler deploys it', () => {
    const packageJson = JSON.parse(
      readFileSync(projectFile('package.json'), 'utf8')
    ) as {
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    expect(packageJson.scripts['build:worker']).toContain(
      'wrangler pages functions build functions --outdir .worker'
    );
    expect(packageJson.scripts.build).toBe(
      'npm run build:web && npm run build:worker'
    );
    expect(packageJson.scripts['deploy:cf']).toBe('wrangler deploy');
    expect(packageJson.devDependencies.wrangler).toBe('4.121.0');
  });
});
