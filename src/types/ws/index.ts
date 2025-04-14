import type { ItemByCollectionSlug } from './items';

export type { ItemByCollectionSlug };

interface WebSocketMessage {
	id: string | null;
	type: string;
	payload: Record<string, any>;
}

interface ConnectionAckMessage extends WebSocketMessage {
	id: null;
	type: 'connection_ack';
	payload: {};
}

interface UseCollectionItemsMessage extends WebSocketMessage {
	id: string;
	type: 'next';
	payload: {
		data: ItemByCollectionSlug;
	};
}

export type WebSocketMessageUnion =
	| ConnectionAckMessage
	| UseCollectionItemsMessage;
