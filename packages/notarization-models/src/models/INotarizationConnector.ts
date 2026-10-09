// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@3sixty/core";
import type { INotarization } from "./INotarization.js";

/**
 * Interface describing a notarization connector.
 */
export interface INotarizationConnector extends IComponent {
	/**
	 * Create a new notarization.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @param notarization The notarization data without the generated fields.
	 * @returns The generated notarization id.
	 */
	create(
		controllerIdentity: string,
		notarization: Omit<INotarization, "id" | "dateCreated">
	): Promise<string>;

	/**
	 * Get an existing notarization.
	 * @param id The id of the notarization to get.
	 * @returns The notarization.
	 */
	get(id: string): Promise<INotarization>;

	/**
	 * Remove an existing notarization.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @param id The id of the notarization to remove.
	 * @returns A promise that resolves when the notarization has been removed.
	 */
	remove(controllerIdentity: string, id: string): Promise<void>;

	/**
	 * Update an existing notarization.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @param notarization The notarization to update.
	 * @returns A promise that resolves when the notarization has been updated.
	 */
	update(controllerIdentity: string, notarization: INotarization): Promise<void>;

	/**
	 * Transfer an existing notarization.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @param id The id of the notarization to transfer.
	 * @param recipientAddress The recipient address.
	 * @returns A promise that resolves when the notarization has been transferred.
	 */
	transfer(controllerIdentity: string, id: string, recipientAddress: string): Promise<void>;
}
