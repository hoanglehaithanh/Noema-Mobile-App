/**
 * Links this repo to the Supabase project from EXPO_PUBLIC_SUPABASE_URL and runs `supabase db push`.
 * Requires SUPABASE_DB_PASSWORD in .env (Dashboard → Project Settings → Database).
 */
const { config } = require('dotenv');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.join(__dirname, '..');
config({ path: path.join(root, '.env') });

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const password = process.env.SUPABASE_DB_PASSWORD;

if (!url) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL in .env');
  process.exit(1);
}
if (!password) {
  console.error(
    'Missing SUPABASE_DB_PASSWORD in .env.\n'
      + 'Copy the database password from Supabase Dashboard → Project Settings → Database.',
  );
  process.exit(1);
}

let host;
try {
  host = new URL(url).hostname;
}
catch {
  console.error('Invalid EXPO_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

const ref = host.split('.')[0];
if (!ref || !host.endsWith('.supabase.co')) {
  console.error('Could not parse project ref from EXPO_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

const run = (args) => {
  execFileSync('npx', args, { cwd: root, stdio: 'inherit', env: process.env });
};

console.log(`Linking to Supabase project ref: ${ref}`);
run([
  'supabase@latest',
  'link',
  '--project-ref',
  ref,
  '--password',
  password,
  '--yes',
]);

console.log('Applying migrations…');
run(['supabase@latest', 'db', 'push']);
