import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { BigNumber, Contract } from 'ethers';
import { CompilerOutputBytecode } from 'hardhat/types';
import Task from './task';

export const NETWORKS = ['boba', 'aurora', 'moonriver', 'polygon', 'moonbeam', 'optimism'];

export type Network = typeof NETWORKS[number];

export type TaskRunOptions = {
  force?: boolean;
  from?: SignerWithAddress;
};

export type NAry<T> = T | Array<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Param = boolean | string | number | BigNumber | any;

export type Input = {
  [key: string]: NAry<Param>;
};

export type RawInputByNetwork = {
  [key in Network]: RawInputKeyValue;
};

export type RawInputKeyValue = {
  [key: string]: NAry<Param> | Output | Task;
};

export type RawInput = RawInputKeyValue | RawInputByNetwork;

export type Output = {
  [key: string]: string;
};

export type RawOutput = {
  [key: string]: string | Contract;
};

export type Libraries = { [key: string]: string };

export type Artifact = {
  abi: unknown[];
  evm: {
    bytecode: CompilerOutputBytecode;
    deployedBytecode: CompilerOutputBytecode;
    methodIdentifiers: {
      [methodSignature: string]: string;
    };
  };
};
