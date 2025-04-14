import { readFileSync } from 'fs';

import { CONFIG } from '@/constants/config';
import { Wallet } from '@/core';
import { Nft } from '@/core/nft';
import { WebSocket } from '@/core/ws';
import { logger } from '@/lib/logger';

async function main() {
	logger.info('-'.repeat(50));
	console.clear();

	const KEY = readFileSync(CONFIG.KEY_PATH, 'utf-8');

	const wallet = new Wallet(KEY);
	const nft = new Nft(wallet);
	const ws = new WebSocket(nft);

	ws.connect();
}

main().catch(error => {
	logger.error('Application error:', error);
	process.exit(1);
});
