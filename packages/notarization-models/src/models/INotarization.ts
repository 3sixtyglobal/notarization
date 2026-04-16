// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { NotarizationMode } from "./notarizationMode.js";

/**
 * Interface describing a notarization.
 */
export interface INotarization {
	/**
	 * The unique identifier of the notarization.
	 */
	id: string;

	/**
	 * The notarization mode.
	 */
	mode: NotarizationMode;

	/**
	 * The date and time when the notarization was created, in ISO 8601 format.
	 */
	dateCreated: string;

	/**
	 * The date and time when the notarization was last modified, in ISO 8601 format.
	 */
	dateModified?: string;

	/**
	 * The notarization data as a byte array.
	 */
	data: Uint8Array;

	/**
	 * An optional description of the notarization that cannot be changed after creation.
	 */
	immutableDescription?: string;

	/**
	 * An optional description of the notarization that can be modified until the notarization is locked.
	 */
	description?: string;

	/**
	 * An optional lock date, in ISO 8601 format, that prevents deletion until the date is reached.
	 * Used only in Locked Notarization, it prevents the object from being deleted until the lock expires.
	 */
	deleteLockDateTime?: string;

	/**
	 * An optional flag indicating transfer lock is active until the notarization is destroyed.
	 * Used only in Dynamic Notarization.
	 */
	transferLockUntilDestroyed?: boolean;

	/**
	 * An optional transfer lock date-time, in ISO 8601 format.
	 * Used only in Dynamic Notarization.
	 */
	transferLockDateTime?: string;
}
