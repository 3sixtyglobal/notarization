// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@3sixty/entity";
import type { NotarizationMode } from "@3sixty/notarization-models";

/**
 * Class describing a notarization record.
 */
@entity()
export class Notarization {
	/**
	 * The identity of the notarization record.
	 */
	@property({ type: "string", isPrimary: true, maxLength: 255 })
	public id!: string;

	/**
	 * The notarization mode.
	 */
	@property({ type: "string", maxLength: 16 })
	public mode!: NotarizationMode;

	/**
	 * The date and time when the notarization was created, in ISO 8601 format.
	 */
	@property({ type: "string", format: "date-time" })
	public dateCreated!: string;

	/**
	 * The date and time when the notarization was last modified, in ISO 8601 format.
	 */
	@property({ type: "string", format: "date-time", optional: true })
	public dateModified?: string;

	/**
	 * The notarization data as a base64 string.
	 */
	@property({ type: "string" })
	public data!: string;

	/**
	 * An optional description of the notarization that cannot be changed after creation.
	 */
	@property({ type: "string", maxLength: 4096, optional: true })
	public immutableDescription?: string;

	/**
	 * An optional description of the notarization that can be modified until the notarization is locked.
	 */
	@property({ type: "string", maxLength: 4096, optional: true })
	public description?: string;

	/**
	 * An optional lock date, in ISO 8601 format, that prevents deletion until the date is reached.
	 */
	@property({ type: "string", format: "date-time", optional: true })
	public deleteLockDateTime?: string;

	/**
	 * An optional flag indicating transfer lock is active until notarization destruction.
	 */
	@property({ type: "boolean", optional: true })
	public transferLockUntilDestroyed?: boolean;

	/**
	 * An optional transfer lock date-time, in ISO 8601 format.
	 */
	@property({ type: "string", format: "date-time", optional: true })
	public transferLockDateTime?: string;

	/**
	 * The controller identity.
	 */
	@property({ type: "string", maxLength: 255 })
	public controllerIdentity!: string;

	/**
	 * The owner of the notarization.
	 */
	@property({ type: "string", maxLength: 255 })
	public owner!: string;
}
