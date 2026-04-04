export interface ParsedTask {
	cleanTitle: string;
	context?: string;
	delegatedTo?: string;
	estimatedMinutes?: number;
}

/**
 * Parses special keywords from a raw task title string:
 *  - `#tag`   → context   (moves task to Next Actions)
 *  - `@person` → delegatedTo (moves task to Waiting For)
 *  - `~Nm` / `~Nh` → estimatedMinutes (minutes or hours)
 *
 * All matched tokens are stripped from the returned `cleanTitle`.
 */
export function parseTaskTitle(raw: string): ParsedTask {
	let title = raw;
	let context: string | undefined;
	let delegatedTo: string | undefined;
	let estimatedMinutes: number | undefined;

	// Extract ~Nm (minutes) or ~Nh (hours)
	const timeMatch = title.match(/~(\d+)(m|h)(?=\s|$)/i);
	if (timeMatch) {
		const value = parseInt(timeMatch[1], 10);
		estimatedMinutes = timeMatch[2].toLowerCase() === 'h' ? value * 60 : value;
		title = title.replace(/~\d+(m|h)(?=\s|$)/gi, '').trim().replace(/\s{2,}/g, ' ');
	}

	// Extract @person (first occurrence; supports hyphens and apostrophes)
	const delegatedMatch = title.match(/@([\w'-]+)/);
	if (delegatedMatch) {
		delegatedTo = delegatedMatch[1];
		title = title.replace(/@[\w'-]+/g, '').trim().replace(/\s{2,}/g, ' ');
	}

	// Extract #context (first occurrence; supports hyphens)
	const contextMatch = title.match(/#([\w-]+)/);
	if (contextMatch) {
		context = contextMatch[1];
		title = title.replace(/#[\w-]+/g, '').trim().replace(/\s{2,}/g, ' ');
	}

	return { cleanTitle: title, context, delegatedTo, estimatedMinutes };
}
