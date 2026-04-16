// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Supported notarization modes.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const NotarizationMode = {
	/**
	 * Dynamic notarization mode.
	 */
	Dynamic: "dynamic",

	/**
	 * Locked notarization mode.
	 */
	Locked: "locked"
} as const;

/**
 * Supported notarization mode values.
 */
export type NotarizationMode = (typeof NotarizationMode)[keyof typeof NotarizationMode];
