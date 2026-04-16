// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Request to remove a notarization.
 */
export interface INotarizationRemoveRequest {
	/**
	 * The request path parameters.
	 */
	pathParams: {
		/**
		 * The id of the notarization to remove.
		 */
		id: string;
	};
}
