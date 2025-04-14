import type Web3 from 'web3';

import { logger } from '@/lib/logger';

export function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function sleep(s: number, info?: string) {
	if (s <= 0) return;
	const message = info
		? `${info} Sleeping for ${s.toFixed(2)} seconds...`
		: `Sleeping for ${s.toFixed(2)} seconds...`;
	logger.info(message);
	return new Promise(resolve => setTimeout(resolve, s * 1000));
}

export function isValidAddress(address: string, web3: Web3): boolean {
	try {
		web3.utils.toChecksumAddress(address);
		return true;
	} catch {
		return false;
	}
}
