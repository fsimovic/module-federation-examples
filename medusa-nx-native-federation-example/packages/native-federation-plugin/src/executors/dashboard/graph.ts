import { existsSync } from 'fs';
import * as path from 'path';
import { ProjectGraph, ProjectGraphProjectNode } from '@nrwl/devkit';
import { NFPDashboardDependency, NFPDashboardModule } from './schema';
import { readFileAsJson } from './util';

/**
 * Reads a project dependencies graph, gets Npm package names 
 * and collects `NFPDashboardDependency` properties from `package.json` per Npm package
 */
export function readProjectDependencies(
  graph: ProjectGraph,
  rootPath: string,
  projectName: string
): NFPDashboardDependency[] {
  const projectGraph: ProjectGraphProjectNode = graph.nodes[projectName];
  const projectSrcPath: string = projectGraph.data.sourceRoot;
  
  // get project files which contain dependencies
  const dependencies: string[] = projectGraph.data.files
    .filter((file) => file.file.startsWith(projectSrcPath) && file.deps)
    .map((file) => file.deps)
    .flat();

  // get npm only dependencies
  const packages: string[] = [...new Set(dependencies)]
    .filter((name) => name.startsWith('npm:'))
    .map((name) => name.replace('npm:', ''))
    .sort();

  // read 'package.json' per npm dependency
  const modules: NFPDashboardDependency[] = packages
    .map((name) => path.join(rootPath, `./node_modules/${name}/package.json`))
    .filter((path) => existsSync(path))
    .map((path) => {
      const { name, version, license } = readFileAsJson(path) as NFPDashboardDependency; 
      return { 
        name, 
        version, 
        license 
      };
    });

  return modules;
}

/**
 * 
 */
export async function readProjectExposedModules(
  graph: ProjectGraph,
  rootPath: string,
  projectName: string
): Promise<NFPDashboardModule[]> {
  const projectGraph: ProjectGraphProjectNode = graph.nodes[projectName];
  const projectPath: string = projectGraph.data.root;
  let projectFederationConfig: { exposes: {[key: string]: string} };

  try {
    projectFederationConfig = await import(path.join(rootPath, `${projectPath}/federation.config.js`)) || {};
  } catch (e) {
    throw new Error(`Error occurred while reading exposed modules: ${e}`);
  }
  
  const exposes: [string, string][] = Object.entries(projectFederationConfig.exposes || {}); 

  // './Module' to 'Module'
  const exposeNames: string[] = exposes.map((file) => path.basename(file[0]));
  const exposePaths: string[] = exposes.map((file) => file[1]);

  console.log(exposeNames, exposePaths);

  return projectGraph.data.files
    .filter((file) => exposePaths.indexOf(file.file) > -1)
    .map((file) => {
      //const ;
      return {
        id: `${projectName}:`,
        name: '',
        file: file.file,
        requires: file.deps?.map((name) => name.replace('npm:', '')),
        applicationID: projectName,
      };
    });
}