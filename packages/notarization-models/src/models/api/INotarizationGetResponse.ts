// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { INotarization } from "../INotarization.js";

/**
 * Response for getting a notarization.
 */
export interface INotarizationGetResponse {
	/**
	 * The response body.
	 */
	body: Omit<INotarization, "data"> & {
		/**
		 * The notarization data as a base64 encoded string.
		 */
		data: string;
	};
}
