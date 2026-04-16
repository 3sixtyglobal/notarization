// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Options for the entity storage notarization connector constructor.
 */
export interface IEntityStorageNotarizationConnectorConstructorOptions {
	/**
	 * The entity storage type for notarization data.
	 * @default notarization
	 */
	notarizationEntityStorageType?: string;

	/**
	 * The logging component type.
	 * @default logging
	 */
	loggingComponentType?: string;
}
