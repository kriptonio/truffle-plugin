export interface TruffleConfig {
  working_directory: string;
  contracts_build_directory: string;
  kriptonio: UploadConfig;
}

export interface UploadConfig {
  accessToken: string;
  chainId: number;
  apiUrl: string;
  appUrl: string;
  contract: string;
  title: string;
}
