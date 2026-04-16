// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IIotaConfig } from "@twin.org/dlt-iota";

/**
 * Configuration for the IOTA Notarization Connector.
 */
export interface IIotaNotarizationConnectorConfig extends IIotaConfig {
	/**
	 * The wallet address index to use when performing notarization operations.
	 * @default 0
	 */
	walletAddressIndex?: number;

	/**
	 * Enable cost logging.
	 * @default false
	 */
	enableCostLogging?: boolean;
}
