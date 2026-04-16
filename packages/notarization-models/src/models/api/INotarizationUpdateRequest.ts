// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { INotarization } from "../INotarization.js";

/**
 * Request to update a notarization.
 */
export interface INotarizationUpdateRequest {
	/**
	 * The request path parameters.
	 */
	pathParams: {
		/**
		 * The id of the notarization to update.
		 */
		id: string;
	};

	/**
	 * The request data.
	 */
	body: INotarization;
}
