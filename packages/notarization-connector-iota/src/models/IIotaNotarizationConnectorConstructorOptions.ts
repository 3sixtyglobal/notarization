// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IIotaNotarizationConnectorConfig } from "./IIotaNotarizationConnectorConfig.js";

/**
 * Options for the IotaNotarizationConnector constructor.
 */
export interface IIotaNotarizationConnectorConstructorOptions {
	/**
	 * The vault connector type to use.
	 * @default vault
	 */
	vaultConnectorType?: string;

	/**
	 * The wallet connector type to use.
	 * @default wallet
	 */
	walletConnectorType?: string;

	/**
	 * The logging component type.
	 * @default logging
	 */
	loggingComponentType?: string;

	/**
	 * The configuration to use for the connector.
	 */
	config: IIotaNotarizationConnectorConfig;
}
