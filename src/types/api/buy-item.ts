export interface BuyItemResponse {
	data: {
		buyItems: BlockchainActionResponse;
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

interface BlockchainActionResponse {
	actions: BuyItemAction[];
	errors: any[];
	__typename: 'BlockchainActionResponse';
}

interface BuyItemAction {
	__typename: 'BuyItemAction';
	transactionSubmissionData: TransactionSubmissionData;
	items: Item[];
}

interface TransactionSubmissionData {
	chain: Chain;
	to: string;
	data: string;
	value: string;
	__typename: 'TransactionSubmissionData';
}

interface Chain {
	networkId: number;
	identifier: string;
	blockExplorer: {
		name: string;
		transactionUrlTemplate: string;
		__typename: 'BlockExplorer';
	};
	__typename: 'Chain';
}

interface Item {
	imageUrl: string;
	id: string;
	__typename: 'Item';
}
