export interface ISettings {
	readonly TARGET_PRICES: Record<string, number>;
	readonly RPC_URL: string;
	readonly GAS_MULTIPLIER: [number, number];
}
