import * as path from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { readFileAsJson } from './util';

/**
 * 
 */
export function createGitSha(): string {
  try {
    return execSync('git rev-parse HEAD')
      .toString()
      .trim();
  } catch (e) {
    throw new Error(`Error occurred while creating GitSha: ${e}`);
  }
}

/**
 * 
 */
export function createVersion(strategy: string): string {
  if (strategy === 'Date') {
    return `${Date.now()}`;
  }

  return createGitSha();
}

/**
 *
 */
export function readNxRunBuildHash(target: string, rootPath: string): string {
  const cacheFilePath = path.join(rootPath, `./node_modules/.cache/nx/run.json`);

  if (!existsSync(cacheFilePath)) {
    return '';
  }

  const task = readFileAsJson(cacheFilePath).tasks
    .find((task) => task.taskId === target);

  return task?.hash || '';
}