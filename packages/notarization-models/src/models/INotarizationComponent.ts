// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { INotarization } from "./INotarization.js";

/**
 * Interface describing a notarization component.
 */
export interface INotarizationComponent extends IComponent {
	/**
	 * Create a new notarization.
	 * @param notarization The notarization data without the generated fields.
	 * @param namespace The namespace of the connector to use for the notarization, defaults to component configured namespace.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns The generated notarization id.
	 */
	create(
		notarization: Omit<INotarization, "id" | "dateCreated">,
		namespace?: string,
		controllerIdentity?: string
	): Promise<string>;

	/**
	 * Get an existing notarization.
	 * @param id The id of the notarization to get.
	 * @returns The notarization.
	 */
	get(id: string): Promise<INotarization>;

	/**
	 * Remove an existing notarization.
	 * @param id The id of the notarization to remove.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns A promise that resolves when the notarization has been removed.
	 */
	remove(id: string, controllerIdentity?: string): Promise<void>;

	/**
	 * Update an existing notarization.
	 * @param notarization The notarization to update.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns A promise that resolves when the notarization has been updated.
	 */
	update(notarization: INotarization, controllerIdentity?: string): Promise<void>;

	/**
	 * Transfer an existing notarization.
	 * @param id The id of the notarization to transfer.
	 * @param recipientAddress The recipient address.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns A promise that resolves when the notarization has been transferred.
	 */
	transfer(id: string, recipientAddress: string, controllerIdentity?: string): Promise<void>;
}
