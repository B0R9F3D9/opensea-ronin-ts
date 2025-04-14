import { type Numbers, type Transaction, Web3 } from 'web3';

import { CONFIG } from '@/constants/config';
import { SETTINGS } from '@/constants/settings';
import { logger } from '@/lib/logger';
import { isValidAddress, randomFloat } from '@/lib/utils';

export class Wallet {
	public web3: Web3;
	public address: string;
	private privateKey: string;

	constructor(privateKey: string) {
		this.web3 = new Web3(SETTINGS.RPC_URL);
		const acc = this.web3.eth.accounts.privateKeyToAccount(privateKey);
		this.privateKey = acc.privateKey;
		this.address = acc.address;
	}

	async getTxData(
		to: string,
		value: Numbers = 0,
		data: string = '0x',
	): Promise<Transaction> {
		try {
			if (!isValidAddress(to, this.web3))
				throw new Error('Invalid receiver address');

			const [nonce, gasPrice] = await Promise.all([
				this.web3.eth.getTransactionCount(this.address, 'pending'),
				this.web3.eth.getGasPrice(),
			]);

			return {
				from: this.address,
				to: this.web3.utils.toChecksumAddress(to),
				data,
				value,
				gasPrice: Math.floor(
					Number(gasPrice) * randomFloat(...SETTINGS.GAS_MULTIPLIER),
				),
				nonce,
				chainId: CONFIG.CHAIN_ID,
			};
		} catch (error) {
			throw new Error('Failed to get tx data: ' + (error as Error));
		}
	}

	async sendTx(txData: Transaction): Promise<string> {
		try {
			txData.gas = await this.web3.eth.estimateGas(txData, 'pending');
			if (!txData.gas) throw new Error('Failed to estimate gas');

			const signed = await this.web3.eth.accounts.signTransaction(
				txData,
				this.privateKey,
			);
			const txHash = await this.web3.eth.sendSignedTransaction(
				signed.rawTransaction,
			);
			return this.waitTx(txHash.transactionHash.toString());
		} catch (error) {
			throw new Error('Failed to send tx: ' + (error as Error));
		}
	}

	private async waitTx(txHash: string): Promise<string> {
		const startTime = Date.now();
		while (true) {
			try {
				const receipt = await this.web3.eth.getTransactionReceipt(txHash);
				const status = Number(receipt.status);
				if (status === 1) return txHash;
				else if (status === 0) throw new Error(`Tx failed: ${txHash}`);
				await new Promise(resolve => setTimeout(resolve, 300));
			} catch (e) {
				if (e instanceof Error && e.message.includes('not found')) {
					if (Date.now() - startTime > 30000) {
						throw new Error(`Tx not found: ${txHash}`);
					}
					await new Promise(resolve => setTimeout(resolve, 300));
				} else {
					throw e;
				}
			}
		}
	}
}
