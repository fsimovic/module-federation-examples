import * as path from 'path';
import { ProjectGraph } from '@nrwl/devkit';
import { NFPDashboardOptions, NFPDashboardOutputFile } from './schema';
import { createGitSha, createVersion, readNxRunBuildHash } from './version';
import { readProjectDependencies, readProjectExposedModules } from './graph';
import { writeFileAsJson } from './util';

/**
 * 
 */
export async function buildDashboardFile(graph: ProjectGraph, options: NFPDashboardOptions) {
  const {
    buildTarget, 
    name,
    rootPath,
    outputPath, 
    filename = 'dashboard.json',
    versionStrategy,
    environment = 'development',
    metadata 
  } = options;

  const dashboard: NFPDashboardOutputFile = {
    id: name,
    name,
    remote: metadata.remote,
    version: createVersion(versionStrategy),
    sha: createGitSha(),
    buildHash: readNxRunBuildHash(buildTarget, rootPath),
    environment,
    metadata,
    dependencies: readProjectDependencies(graph, rootPath, name),
    devDependencies: [],
    overrides: [],
    modules: await readProjectExposedModules(graph, rootPath, name),
    consumes: []
  };

  const outputFile = path.join(outputPath, filename);
  writeFileAsJson(outputFile, dashboard);
}

/**
 * 
 */
export function sendDashboardFile(url: string): void {
  return;
}