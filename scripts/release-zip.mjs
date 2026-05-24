#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import archiver from 'archiver';

const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, 'package.json');
const manifestPath = path.join(rootDir, 'manifest.json');
const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(rootDir, 'release');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeTag(tagValue) {
  if (!tagValue) {
    return '';
  }

  return tagValue.replace(/^refs\/tags\//, '').replace(/^v/, '');
}

function runBuild() {
  const npmExecPath = process.env.npm_execpath;
  if (!npmExecPath) {
    throw new Error('Unable to resolve npm executable path from npm_execpath.');
  }

  const result = spawnSync(process.execPath, [npmExecPath, 'run', 'build'], {
    stdio: 'inherit',
    cwd: rootDir,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error('Build failed.');
  }
}

function ensureReleaseMetadataVersion(packageVersion, manifestVersion, tagVersion) {
  if (!packageVersion || !manifestVersion) {
    throw new Error('Both package.json and manifest.json must have a version.');
  }

  if (packageVersion !== manifestVersion) {
    throw new Error(
      `Version mismatch: package.json=${packageVersion}, manifest.json=${manifestVersion}.`
    );
  }

  if (tagVersion && tagVersion !== packageVersion) {
    throw new Error(
      `Tag/version mismatch: pushed tag=${tagVersion}, package/manifest version=${packageVersion}.`
    );
  }
}

async function createZip(version) {
  if (!fs.existsSync(distDir)) {
    throw new Error('Missing dist folder. Build did not produce output.');
  }

  fs.mkdirSync(releaseDir, { recursive: true });

  const zipPath = path.join(releaseDir, `chrome-refresh-bookmarks-v${version}.zip`);
  if (fs.existsSync(zipPath)) {
    fs.rmSync(zipPath);
  }

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(distDir, false);
    archive.finalize();
  });

  return zipPath;
}

async function main() {
  const packageJson = readJson(packageJsonPath);
  const manifestJson = readJson(manifestPath);

  const argvTag = process.argv.find((arg) => arg.startsWith('--tag='));
  const rawTag = argvTag ? argvTag.split('=')[1] : process.env.GITHUB_REF_NAME || process.env.RELEASE_TAG;
  const tagVersion = normalizeTag(rawTag);

  const version = packageJson.version;
  ensureReleaseMetadataVersion(version, manifestJson.version, tagVersion);

  runBuild();
  const zipPath = await createZip(version);

  console.log(`Created: ${zipPath}`);
}

main().catch((error) => {
  console.error(`Release zip failed: ${error.message}`);
  process.exit(1);
});


