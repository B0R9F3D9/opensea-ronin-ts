import { readFileSync } from 'fs';

import { CONFIG } from '@/constants/config';
import type { ISettings } from '@/types/settings';

function removeComments(jsonString: string): string {
	return jsonString
		.split('\n')
		.map(line => line.replace(/\/\/\s.*$/, ''))
		.join('\n')
		.trim();
}

const rawData = readFileSync(CONFIG.SETTINGS_PATH, 'utf-8');
const cleanedData = removeComments(rawData);
export const SETTINGS = JSON.parse(cleanedData) as ISettings;
