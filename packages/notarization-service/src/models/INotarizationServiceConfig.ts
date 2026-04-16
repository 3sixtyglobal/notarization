// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the Notarization Service.
 */
export interface INotarizationServiceConfig {
	/**
	 * What is the default connector to use for notarization. If not provided the first connector from the factory will be used.
	 */
	defaultNamespace?: string;
}
