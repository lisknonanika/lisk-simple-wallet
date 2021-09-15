import * as config from './config';

export const getExplorerURL = (network:number, type:number) => {
  return config.LISK.EXPLORER[type][network];
}