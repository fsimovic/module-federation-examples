import { readFileSync, writeFileSync } from 'fs';

export function readFileAsJson(path: string): any {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new Error(e);
  }
}

export function writeFileAsJson(path: string, data: object): void {
  try {
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    throw new Error(e);
  }
}