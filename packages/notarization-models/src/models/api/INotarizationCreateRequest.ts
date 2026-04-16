// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { INotarization } from "../INotarization.js";

/**
 * Request to create a notarization.
 */
export interface INotarizationCreateRequest {
	/**
	 * The request data.
	 */
	body: Omit<INotarization, "id" | "dateCreated"> & {
		/**
		 * The namespace of the connector to use for the notarization, defaults to component configured namespace.
		 */
		namespace?: string;
	};
}
