// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The metric IDs for the notarization domain.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const NotarizationMetricIds = {
	/**
	 * Number of notarizations created.
	 */
	NotarizationsCreated: "notarization_notarizations_created",
	/**
	 * Number of notarizations updated.
	 */
	NotarizationsUpdated: "notarization_notarizations_updated",
	/**
	 * Number of notarizations transferred.
	 */
	NotarizationsTransferred: "notarization_notarizations_transferred",
	/**
	 * Number of notarizations removed.
	 */
	NotarizationsRemoved: "notarization_notarizations_removed"
} as const;

/**
 * Union type of all notarization metric ID string values.
 */
export type NotarizationMetricIds =
	(typeof NotarizationMetricIds)[keyof typeof NotarizationMetricIds];
