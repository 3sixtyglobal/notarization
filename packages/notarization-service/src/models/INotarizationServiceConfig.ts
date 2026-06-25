// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the Notarization Service.
 */
export interface INotarizationServiceConfig {
	/**
	 * The default connector namespace to use for notarization; defaults to the first registered connector.
	 */
	defaultNamespace?: string;
}
