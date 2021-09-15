import * as config from './config';

export const getApiURL = (network:number) => {
  return config.API[network];
}

export const getWsURL = (network:number) => {
  return config.WS[network];
}

export const getExplorerURL = (network:number, type:number) => {
  return config.EXPLORER[type][network];
}

export const getTransferAssetSchema = () => {
  return config.SHEMAS.find((schema) => {return schema.moduleAssetId === "2:0"}).schema;
}