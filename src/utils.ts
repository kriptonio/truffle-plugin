import { UploadConfig } from './types';

export function getConfigValue(key: keyof UploadConfig, config: Partial<UploadConfig>) {
  return config[key];
}

export function getRequiredConfigValue(key: keyof UploadConfig, config: Partial<UploadConfig>) {
  const value = getConfigValue(key, config);
  enforceOrThrow(!!value, `Configuration value for key ${key} missing. Please provide it via truffle-config.js file`);

  return value;
}

export function enforceOrThrow(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}
