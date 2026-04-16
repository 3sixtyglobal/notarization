// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Request to transfer a notarization.
 */
export interface INotarizationTransferRequest {
	/**
	 * The request path parameters.
	 */
	pathParams: {
		/**
		 * The id of the notarization to transfer.
		 */
		id: string;
	};

	/**
	 * The request data.
	 */
	body: {
		/**
		 * The recipient address.
		 */
		recipientAddress: string;
	};
}
