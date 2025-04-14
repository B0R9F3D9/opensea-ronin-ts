import { BUY_ITEM_QUERY } from '@/constants/api/buy-item';
import { CHECKOUT_FLOW_QUERY } from '@/constants/api/checkout-flow';
import { CONFIG } from '@/constants/config';
import { Wallet } from '@/core/wallet';
import type { BuyItemResponse } from '@/types/api/buy-item';
import type { CheckoutFlowResponse } from '@/types/api/checkout-flow';

export class Nft {
	private wallet: Wallet;

	constructor(wallet: Wallet) {
		this.wallet = wallet;
	}

	private async getPrice(id: string, quantity: number): Promise<number> {
		const response = await fetch(CONFIG.API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				operationName: 'CheckoutFlowQuery',
				query: CHECKOUT_FLOW_QUERY,
				variables: {
					address: this.wallet.address,
					itemQuantities: [
						{
							item: {
								chain: 'ronin',
								contractAddress: CONFIG.NFT_ADDRESS.toLowerCase(),
								tokenId: id,
							},
							quantity,
						},
					],
					substituteItems: false,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as CheckoutFlowResponse;

		if (!data.data.buyQuote) {
			throw new Error('Failed to get NFT price: ' + JSON.stringify(data));
		}

		return data.data.buyQuote.totalPrice.pricePerToken[0].token.unit;
	}

	private async getTxData(id: string, quantity: number, price: number) {
		const response = await fetch(CONFIG.API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				operationName: 'BuyItemQuery',
				query: BUY_ITEM_QUERY,
				variables: {
					address: this.wallet.address,
					blurAuthToken: null,
					itemQuantities: [
						{
							item: {
								chain: 'ronin',
								contractAddress: CONFIG.NFT_ADDRESS.toLowerCase(),
								tokenId: id,
							},
							orderId: null,
							pricePerItem: {
								contractAddress: '0x0000000000000000000000000000000000000000',
								unit: price.toString(),
							},
							quantity,
						},
					],
					substituteItems: false,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as BuyItemResponse;

		if (data.data.buyItems.errors.length || !data.data.buyItems.actions.length)
			throw new Error('Failed to get tx data: ' + JSON.stringify(data));

		const tx = data.data.buyItems.actions[0].transactionSubmissionData;
		return {
			data: tx.data,
			to: tx.to,
			value: tx.value,
		};
	}

	async buy(id: string, maxPrice: number, quantity: number) {
		const price = await this.getPrice(id, quantity);
		if (price > maxPrice) throw new Error('Price too high');
		const { data, to, value } = await this.getTxData(id, quantity, price);
		if (Number(value) > maxPrice * 10 ** CONFIG.RON_DECIMAL)
			throw new Error('Price too high');
		return await this.wallet.sendTx(
			await this.wallet.getTxData(to, value, data),
		);
	}
}
