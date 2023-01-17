import { promisify } from 'util';
import { exec, spawn } from 'child_process';
import { 
  ExecutorContext, 
  ProjectGraph,
  parseTargetString, 
  readTargetOptions,
  createProjectGraphAsync
} from '@nrwl/devkit';
import { NFPDashboardExecutorOptions, NFPDashboardToken } from './schema';
import { readFileTokens, replaceWithTokens } from './token';
import { buildDashboardFile } from './dashboard';

/**
 *
 */
async function executeProjectBuild(
  options: NFPDashboardExecutorOptions
): Promise<{ stdout: string; stderr: string }> {
  const { buildTarget } = options;
  const buildCommand = `
    npx nx run ${buildTarget} --skip-nx-cache
  `;

  return promisify(exec)(buildCommand);
}

/**
 *
 */
export default async function runExecutor(
  options: NFPDashboardExecutorOptions,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const { projectName, root } = context;
  const { buildTarget } = options;

  // try {
  //   await executeProjectBuild(options);
  // } catch (e) {
  //   console.error(e);
  //   throw e;
  // }

  let graph: ProjectGraph;
  let buildOptions;

  try {
    graph = await createProjectGraphAsync();

   // console.log(context);

    buildOptions = readTargetOptions(
      parseTargetString(buildTarget, graph),
      context
    );
  } catch (e) {
    throw new Error(`Invalid buildTarget: ${buildTarget}`);
  }

  const { filename, environment, metadata, versionStrategy } = options;
  const { outputPath } = buildOptions;

  try {
    buildDashboardFile(graph, {
      buildTarget,
      name: projectName,
      rootPath: root,
      outputPath,
      filename,
      versionStrategy,
      environment,
      metadata
    });
  } catch (e) {
    throw new Error(`Error occurred while creating Dashboard '${filename}': ${e}`);
  }

  const { tokenFile } = options;
  let { dashboardUrl } = options;

  try {
    const tokens: NFPDashboardToken = readFileTokens(tokenFile); 
    dashboardUrl = replaceWithTokens(dashboardUrl, tokens);
  } catch (e) {
    throw new Error(`Invalid token file: ${tokenFile}`);
  }

  return {
    success: true,
  };
}
