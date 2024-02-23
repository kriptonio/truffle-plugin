import { KriptonioError, KriptonioSdk } from '@kriptonio/sdk';
import fs from 'fs';
import path from 'path';
import '../truffle-plugin.json';
import { formatError } from './error';
import { TruffleConfig, UploadConfig } from './types';
import {
  enforceOrThrow,
  getConfigValue,
  getRequiredConfigValue,
} from './utils';

module.exports = async (config: TruffleConfig) => {
  config.kriptonio = parseKriptonioConfig(config);

  const artifact = getArtifact(config.kriptonio.contract, config);
  const json = getInputJSON(artifact, config);
  return upload(json, artifact, config.kriptonio);
};

async function upload(json: any, artifact: any, config: UploadConfig) {
  try {
    const sdk = new KriptonioSdk({ accessToken: config.accessToken });
    sdk.configure({
      apiUrl: config.apiUrl,
    });

    const smartContract = await sdk.smartContract.createFromStandardJson({
      title: config.title,
      chainId: config.chainId,
      contractFile: artifact.ast.absolutePath.replace('project:', ''),
      contractName: config.contract,
      contractStandardJson: JSON.stringify(json),
    });

    console.log(
      `Created Smart Contract with ID ${smartContract.id}. Visit ${config.appUrl} too see it.`
    );
  } catch (e) {
    if (e instanceof KriptonioError) {
      throw new Error(`Server error. ${formatError(e)}`);
    }

    throw e;
  }
}

function getArtifact(contractName: string, options: TruffleConfig) {
  const artifactPath = path.resolve(
    options.contracts_build_directory,
    `${contractName}.json`
  );

  enforceOrThrow(
    fs.existsSync(artifactPath),
    `Cannot find compiled ${contractName} contract. You first need to compile contracts before running this command. Run 'truffle compile' to compile your contracts. If after that this error still shows up, please check if contract name which you provided exists in your contracts.`
  );

  // Stringify + parse to make a deep copy (to avoid bugs with PR #19)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return JSON.parse(JSON.stringify(require(artifactPath)));
}

function parseKriptonioConfig(config: TruffleConfig): UploadConfig {
  return {
    accessToken: getRequiredConfigValue(
      'accessToken',
      config.kriptonio
    ) as string,
    chainId: getRequiredConfigValue('chainId', config.kriptonio) as number,
    apiUrl:
      (getConfigValue('apiUrl', config.kriptonio) as string) ??
      'https://api.kriptonio.com',
    appUrl:
      (getConfigValue('appUrl', config.kriptonio) as string) ??
      'https://app.kriptonio.com',
    contract: getRequiredConfigValue('contract', config.kriptonio) as string,
    title: (getConfigValue('title', config.kriptonio) ??
      getRequiredConfigValue('contract', config.kriptonio)) as string,
  };
}

function getInputJSON(artifact: any, options: TruffleConfig) {
  const metadata = JSON.parse(artifact.metadata);

  // Sort the source files so that the 'main' contract is on top
  const orderedSources = Object.keys(metadata.sources)
    .reverse()
    .sort((a, b) => {
      if (a === artifact.ast.absolutePath) return -1;
      if (b === artifact.ast.absolutePath) return 1;
      return 0;
    });

  const sources: { [key: string]: unknown } = {};
  for (const contractPath of orderedSources) {
    // If we're on Windows we need to de-Unixify the path so that Windows can read the file
    // We also need to replace the 'project:' prefix so that the file can be read
    const normalisedContractPath = normaliseContractPath(contractPath, options);
    const absolutePath = require.resolve(normalisedContractPath);
    const content = fs.readFileSync(absolutePath, 'utf8');

    // Remove the 'project:' prefix that was added in Truffle v5.3.14
    const relativeContractPath = contractPath.replace('project:', '');

    sources[relativeContractPath] = { content };
  }

  const inputJSON = {
    language: metadata.language,
    sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
      remappings: metadata.settings.remappings,
      optimizer: metadata.settings.optimizer,
      evmVersion: metadata.settings.evmVersion,
    },
  };

  return inputJSON;
}

function normaliseContractPath(contractPath: string, options: TruffleConfig) {
  // Replace the 'project:' prefix that was added in Truffle v5.3.14 with the actual project path
  const absolutePath = getAbsolutePath(contractPath, options);

  // If the current platform is not Windows, the path does not need to be changed
  if (process.platform !== 'win32') return absolutePath;

  // If the contract path doesn't start with '/[A-Z]/' it is not a Unixified Windows path
  if (!absolutePath.match(/^\/[A-Z]\//i)) return absolutePath;

  const driveLetter = absolutePath.substring(1, 2);
  const normalisedContractPath = path.resolve(
    `${driveLetter}:/${absolutePath.substring(3)}`
  );

  return normalisedContractPath;
}

function getAbsolutePath(contractPath: string, options: TruffleConfig) {
  // Older versions of truffle already used the absolute path
  // Also node_modules contracts don't use the project: prefix
  if (!contractPath.startsWith('project:/')) return contractPath;

  const relativeContractPath = contractPath.replace('project:/', '');
  const absolutePath = path.join(
    options.working_directory,
    relativeContractPath
  );

  return absolutePath;
}
