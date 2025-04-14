interface Chain {
	identifier: string;
	__typename: 'Chain';
	arch?: string;
}

interface TokenPrice {
	unit: number;
	symbol: string;
	contractAddress: string;
	chain: Chain;
	__typename: 'TokenPrice';
	address?: string;
}

interface Price {
	usd: number;
	token?: TokenPrice;
	native?: { unit: number; __typename: 'TokenPrice' };
	__typename: 'Price';
}

interface OrderProfile {
	address: string;
	__typename: 'OrderProfile';
}

interface BestOrder {
	pricePerItem: Price;
	maker: OrderProfile;
	__typename: 'BestOrder';
	id: string;
	marketplace?: { identifier: string; __typename: 'Marketplace' };
	quantityRemaining: string;
	endTime: string;
	startTime: string;
}

interface Enforcement {
	isDisabled: boolean;
	isCompromised: boolean;
	__typename: 'Enforcement';
	isOwnershipDisputed: boolean;
	isDelisted: boolean;
}

interface ItemRarityType {
	rank: number;
	category: string;
	__typename: 'ItemRarityType';
	totalSupply: number;
}

interface Collection {
	id: string;
	topOffer?: BestOrder;
	__typename: 'Collection';
	isTradingDisabled: boolean;
	slug: string;
}

interface Item {
	id: string;
	createdAt: string;
	lastSaleAt: string | null;
	lastTransferAt: string | null;
	chain: Chain;
	contractAddress: string;
	tokenId: string;
	isFungible: boolean;
	lastSale: Price & {
		token: TokenPrice;
		native: { unit: number; __typename: 'TokenPrice' };
	};
	bestListing: BestOrder;
	enforcement: Enforcement;
	bestItemOffer: BestOrder;
	collection: Collection;
	__typename: 'Item';
	ownership: null;
	bestOffer: BestOrder;
	isTradingDisabled: boolean;
	imageUrl: string;
	animationUrl: string | null;
	backgroundColor: string | null;
	name: string;
	totalSupply: number;
	rarity: ItemRarityType;
	lowestListingForOwner: null;
	owner: null;
	version: number;
}

export interface ItemByCollectionSlug {
	itemByCollectionSlug: Item;
}
