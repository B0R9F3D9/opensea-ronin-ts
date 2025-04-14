export interface CheckoutFlowResponse {
	data: {
		buyQuote: Quote;
	};
	extensions: {
		debugInfo: {
			additionalInformation: {
				'x-trace-id': string;
				'cache-control': string;
				'x-ratelimit-remaining': number;
				'x-cache-status': string;
			};
		};
	};
}

interface Quote {
	itemQuotes: ItemQuote[];
	totalPrice: TotalPrice;
	feeSummary: FeeSummary;
	__typename: 'Quote';
	supportsCrossChainSwap: boolean;
}

interface ItemQuote {
	__typename: 'ItemQuote';
	item: Item;
	quantity: number;
	pricePerItem: Price;
	orderId: string | null;
}

interface Item {
	tokenId: string;
	contractAddress: string;
	chain: Chain;
	__typename: 'Item';
	id: string;
	imageUrl: string;
	isFungible: boolean;
	name: string;
	collection: Collection;
}

interface Chain {
	identifier: string;
	__typename: 'Chain';
}

interface Collection {
	id: string;
	name: string;
	isVerified: boolean;
	__typename: 'Collection';
	floorPrice: {
		pricePerItem: Price;
		__typename: 'BestOrder';
	};
}

interface Price {
	token?: TokenPrice;
	usd: number;
	__typename: 'Price';
}

interface TokenPrice {
	unit: number;
	contractAddress: string;
	symbol: string;
	address?: string;
	chain?: Chain;
	__typename: 'TokenPrice';
}

interface TotalPrice {
	pricePerToken: Array<{
		token: TokenPrice;
		usd: number;
		__typename: 'Price';
	}>;
	__typename: 'TotalPrice';
}

interface FeeSummary {
	marketplaceFeeBasisPoints: number;
	creatorFeeBasisPoints: number;
	__typename: 'FeeSummary';
}
