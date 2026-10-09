// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MetricType, type ITelemetryMetric } from "@3sixty/telemetry-models";
import { NotarizationMetricIds } from "./notarizationMetricIds.js";

/**
 * Metrics registered by the notarization service.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const NotarizationMetrics: ITelemetryMetric[] = [
	{
		id: NotarizationMetricIds.NotarizationsCreated,
		label: "Notarizations created",
		type: MetricType.Counter
	},
	{
		id: NotarizationMetricIds.NotarizationsUpdated,
		label: "Notarizations updated",
		type: MetricType.Counter
	},
	{
		id: NotarizationMetricIds.NotarizationsTransferred,
		label: "Notarizations transferred",
		type: MetricType.Counter
	},
	{
		id: NotarizationMetricIds.NotarizationsRemoved,
		label: "Notarizations removed",
		type: MetricType.Counter
	}
];
