// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The span attribute keys for the notarization domain.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const NotarizationSpanAttributes = {
	/**
	 * The id of the notarization the operation is for.
	 */
	Id: "notarization.id",
	/**
	 * The mode of the notarization.
	 */
	Mode: "notarization.mode"
} as const;

/**
 * Union type of all notarization span attribute key string values.
 */
export type NotarizationSpanAttributes =
	(typeof NotarizationSpanAttributes)[keyof typeof NotarizationSpanAttributes];
