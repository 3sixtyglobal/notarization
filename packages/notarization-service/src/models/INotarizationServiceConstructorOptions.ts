// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { INotarizationServiceConfig } from "./INotarizationServiceConfig.js";

/**
 * Options for the notarization service constructor.
 */
export interface INotarizationServiceConstructorOptions {
	/**
	 * The configuration for the service.
	 */
	config?: INotarizationServiceConfig;
}
