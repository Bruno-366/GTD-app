import { describe, it, expect } from 'vitest';
import { parseTaskTitle } from './parseTask';

describe('parseTaskTitle', () => {
	it('returns the raw title unchanged when no keywords are present', () => {
		const result = parseTaskTitle('Buy groceries');
		expect(result.cleanTitle).toBe('Buy groceries');
		expect(result.context).toBeUndefined();
		expect(result.delegatedTo).toBeUndefined();
		expect(result.estimatedMinutes).toBeUndefined();
	});

	describe('#context extraction', () => {
		it('extracts a context tag and strips it from the title', () => {
			const result = parseTaskTitle('Write report #work');
			expect(result.cleanTitle).toBe('Write report');
			expect(result.context).toBe('work');
		});

		it('extracts a hyphenated context tag', () => {
			const result = parseTaskTitle('Call client #follow-up');
			expect(result.cleanTitle).toBe('Call client');
			expect(result.context).toBe('follow-up');
		});

		it('only extracts the first context tag', () => {
			const result = parseTaskTitle('Task #home #office');
			expect(result.context).toBe('home');
			expect(result.cleanTitle).toBe('Task');
		});
	});

	describe('@person extraction', () => {
		it('extracts a delegatedTo person and strips it from the title', () => {
			const result = parseTaskTitle('Send invoice @alice');
			expect(result.cleanTitle).toBe('Send invoice');
			expect(result.delegatedTo).toBe('alice');
		});

		it("extracts a person name containing apostrophes and hyphens", () => {
			const result = parseTaskTitle("Remind @john-doe about meeting");
			expect(result.delegatedTo).toBe('john-doe');
			expect(result.cleanTitle).toBe('Remind about meeting');
		});

		it('only extracts the first @person', () => {
			const result = parseTaskTitle('Task @alice @bob');
			expect(result.delegatedTo).toBe('alice');
		});
	});

	describe('~time extraction', () => {
		it('extracts minutes (~Nm)', () => {
			const result = parseTaskTitle('Quick call ~5m');
			expect(result.estimatedMinutes).toBe(5);
			expect(result.cleanTitle).toBe('Quick call');
		});

		it('extracts hours (~Nh) and converts to minutes', () => {
			const result = parseTaskTitle('Deep work ~2h');
			expect(result.estimatedMinutes).toBe(120);
			expect(result.cleanTitle).toBe('Deep work');
		});

		it('is case-insensitive for the time unit', () => {
			const result = parseTaskTitle('Meeting ~1H');
			expect(result.estimatedMinutes).toBe(60);
		});

		it('only extracts a time token at a word boundary', () => {
			// "~5m" not followed by space or end → should not match
			const result = parseTaskTitle('No~5match');
			expect(result.estimatedMinutes).toBeUndefined();
		});
	});

	describe('combined keywords', () => {
		it('handles all three keywords together', () => {
			const result = parseTaskTitle('Write docs #work @bob ~30m');
			expect(result.cleanTitle).toBe('Write docs');
			expect(result.context).toBe('work');
			expect(result.delegatedTo).toBe('bob');
			expect(result.estimatedMinutes).toBe(30);
		});

		it('collapses extra whitespace after stripping tokens', () => {
			const result = parseTaskTitle('Do  this  #home  @alice');
			expect(result.cleanTitle).not.toMatch(/\s{2,}/);
		});
	});
});
