// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { INotarizationServiceConfig } from "./INotarizationServiceConfig.js";

/**
 * Options for the notarization service constructor.
 */
export interface INotarizationServiceConstructorOptions {
	/**
	 * The component type for the optional telemetry component used for event metrics.
	 */
	telemetryComponentType?: string;

	/**
	 * The component type for the optional tracing component used for spans.
	 */
	tracingComponentType?: string;

	/**
	 * The configuration for the service.
	 */
	config?: INotarizationServiceConfig;
}
