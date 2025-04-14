import { WebSocket as WsClient } from 'ws';

import { CONFIG } from '@/constants/config';
import { SETTINGS } from '@/constants/settings';
import { USE_COLLECTION_ITEMS_SUBSCRIPTION } from '@/constants/ws/items';
import type { Nft } from '@/core/nft';
import { logger } from '@/lib/logger';
import type { ItemByCollectionSlug, WebSocketMessageUnion } from '@/types/ws';

export class WebSocket {
	private nft: Nft;
	private listingCache: Map<
		string,
		{ price: number; quantity: number; timestamp: number }
	>;

	constructor(nft: Nft) {
		this.nft = nft;
		this.listingCache = new Map();
	}

	connect() {
		const wsClient = new WsClient(CONFIG.WS_URL);

		wsClient
			.on('open', () => {
				wsClient.send(JSON.stringify({ type: 'connection_init' }));
				wsClient.send(JSON.stringify(USE_COLLECTION_ITEMS_SUBSCRIPTION));
				logger.info('WebSocket connection opened');
			})
			.on('message', data => this.processWebSocketMessage(data))
			.on('error', error => {
				logger.error('WebSocket connection error:', error);
				this.connect();
			})
			.on('close', () => {
				logger.info('WebSocket connection closed');
				this.connect();
			});
	}

	processWebSocketMessage(data: WsClient.Data) {
		const msg = JSON.parse(data.toString()) as WebSocketMessageUnion;
		if (
			msg.type === 'connection_ack' &&
			msg.id === null &&
			!Object.keys(msg.payload).length
		)
			return logger.info('Connection ack received');
		else if (msg.type === 'next' && msg.payload.data?.itemByCollectionSlug) {
			const item = msg.payload.data.itemByCollectionSlug;
			if (!item?.bestListing?.pricePerItem?.token) return;
			const price = item.bestListing.pricePerItem.token.unit;
			const quantity = Number(item.bestListing.quantityRemaining);
			if (price > SETTINGS.TARGET_PRICES[item.name]) return;

			const cacheKey = `${item.tokenId}-${price}-${quantity}`;
			const cached = this.listingCache.get(cacheKey);
			if (!cached) {
				this.listingCache.set(cacheKey, {
					price,
					quantity,
					timestamp: Date.now(),
				});
				logger.info(
					`New: ${quantity} ${item.name} for ${price.toFixed(4)} RON (id: ${item.bestListing.id})`,
				);
				this.handleBuy(
					item,
					price,
					SETTINGS.TARGET_PRICES[item.name],
					quantity,
				);
			}
			this.cleanOldCacheEntries();
		} else {
			logger.error('Unknown message:', JSON.stringify(msg));
		}
	}

	private async handleBuy(
		item: ItemByCollectionSlug['itemByCollectionSlug'],
		price: number,
		maxPrice: number,
		quantity: number,
	) {
		try {
			const hash = await this.nft.buy(item.tokenId, maxPrice, quantity);
			logger.info(
				`Successfully bought ${quantity} ${item.name} for ${price.toFixed(4)} RON (id: ${item.bestListing.id}): ${hash}`,
			);
		} catch (error) {
			logger.error(
				`Failed to buy ${quantity} ${item.name} for ${price.toFixed(4)} RON (id: ${item.bestListing.id}):`,
				(error as Error).message || error,
			);
		}
	}

	private cleanOldCacheEntries() {
		const now = Date.now();
		for (const [key, value] of this.listingCache) {
			if (now - value.timestamp > 10 * 1000) this.listingCache.delete(key);
		}
	}
}
