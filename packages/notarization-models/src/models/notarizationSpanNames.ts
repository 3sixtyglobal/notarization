// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The span names for the notarization domain.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const NotarizationSpanNames = {
	/**
	 * Create a notarization.
	 */
	Create: "notarization/create",
	/**
	 * Get a notarization.
	 */
	Get: "notarization/get",
	/**
	 * Update a notarization.
	 */
	Update: "notarization/update",
	/**
	 * Transfer a notarization.
	 */
	Transfer: "notarization/transfer",
	/**
	 * Remove a notarization.
	 */
	Remove: "notarization/remove"
} as const;

/**
 * Union type of all notarization span name string values.
 */
export type NotarizationSpanNames =
	(typeof NotarizationSpanNames)[keyof typeof NotarizationSpanNames];
