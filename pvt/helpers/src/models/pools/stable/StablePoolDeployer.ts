import { Contract } from 'ethers';
import { deploy, deployedAt } from '../../../contract';
import * as expectEvent from '../../../test/expectEvent';
import TypesConverter from '../../types/TypesConverter';
import Vault from '../../vault/Vault';
import VaultDeployer from '../../vault/VaultDeployer';
import StablePool from './StablePool';
import { RawStablePoolDeployment, StablePoolDeployment } from './types';

const NAME = 'Balancer Pool Token';
const SYMBOL = 'BPT';

export default {
  async deploy(params: RawStablePoolDeployment): Promise<StablePool> {
    const deployment = TypesConverter.toStablePoolDeployment(params);
    const vault = params.vault ?? (await VaultDeployer.deploy(TypesConverter.toRawVaultDeployment(params)));
    const pool = await (params.fromFactory ? this._deployFromFactory : this._deployStandalone)(deployment, vault);

    const { owner, tokens, amplificationParameter, swapFeePercentage, meta } = deployment;
    const poolId = await pool.getPoolId();
    return new StablePool(pool, poolId, vault, tokens, amplificationParameter, swapFeePercentage, meta, owner);
  },

  async _deployStandalone(params: StablePoolDeployment, vault: Vault): Promise<Contract> {
    const {
      tokens,
      amplificationParameter,
      swapFeePercentage,
      pauseWindowDuration,
      bufferPeriodDuration,
      oracleEnabled,
      from,
    } = params;

    const owner = TypesConverter.toAddress(params.owner);
    const rateProviders = params.rateProviders || [];
    const priceRateCacheDuration = params.priceRateCacheDuration || [];

    return params.meta
      ? deploy('exchange-vault-pool-stable/MockMetaStablePool', {
          args: [
            {
              vault: vault.address,
              name: NAME,
              symbol: SYMBOL,
              tokens: tokens.addresses,
              rateProviders: rateProviders.map(TypesConverter.toAddress),
              priceRateCacheDuration,
              amplificationParameter,
              swapFeePercentage,
              pauseWindowDuration,
              bufferPeriodDuration,
              oracleEnabled,
              owner,
            },
          ],
          from,
          libraries: { QueryProcessor: (await deploy('QueryProcessor')).address },
        })
      : deploy('exchange-vault-pool-stable/MockStablePool', {
          args: [
            vault.address,
            NAME,
            SYMBOL,
            tokens.addresses,
            amplificationParameter,
            swapFeePercentage,
            pauseWindowDuration,
            bufferPeriodDuration,
            owner,
          ],
          from,
        });
  },

  async _deployFromFactory(params: StablePoolDeployment, vault: Vault): Promise<Contract> {
    const { tokens, amplificationParameter, swapFeePercentage, owner, from } = params;

    const factory = await deploy('exchange-vault-pool-stable/StablePoolFactory', { args: [vault.address], from });
    const tx = await factory.create(
      NAME,
      SYMBOL,
      tokens.addresses,
      amplificationParameter,
      swapFeePercentage,
      TypesConverter.toAddress(owner)
    );
    const receipt = await tx.wait();
    const event = expectEvent.inReceipt(receipt, 'PoolCreated');
    return deployedAt('exchange-vault-pool-stable/StablePool', event.args.pool);
  },
};
