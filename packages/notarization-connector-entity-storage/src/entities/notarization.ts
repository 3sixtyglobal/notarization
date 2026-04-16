// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@twin.org/entity";
import type { NotarizationMode } from "@twin.org/notarization-models";

/**
 * Class describing a notarization record.
 */
@entity()
export class Notarization {
	/**
	 * The identity of the notarization record.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The notarization mode.
	 */
	@property({ type: "string" })
	public mode!: NotarizationMode;

	/**
	 * The date and time when the notarization was created, in ISO 8601 format.
	 */
	@property({ type: "string" })
	public dateCreated!: string;

	/**
	 * The date and time when the notarization was last modified, in ISO 8601 format.
	 */
	@property({ type: "string", optional: true })
	public dateModified?: string;

	/**
	 * The notarization data as a base64 string.
	 */
	@property({ type: "string" })
	public data!: string;

	/**
	 * An optional description of the notarization that cannot be changed after creation.
	 */
	@property({ type: "string", optional: true })
	public immutableDescription?: string;

	/**
	 * An optional description of the notarization that can be modified until the notarization is locked.
	 */
	@property({ type: "string", optional: true })
	public description?: string;

	/**
	 * An optional lock date, in ISO 8601 format, that prevents deletion until the date is reached.
	 */
	@property({ type: "string", optional: true })
	public deleteLockDateTime?: string;

	/**
	 * An optional flag indicating transfer lock is active until notarization destruction.
	 */
	@property({ type: "boolean", optional: true })
	public transferLockUntilDestroyed?: boolean;

	/**
	 * An optional transfer lock date-time, in ISO 8601 format.
	 */
	@property({ type: "string", optional: true })
	public transferLockDateTime?: string;

	/**
	 * The controller identity.
	 */
	@property({ type: "string" })
	public controllerIdentity!: string;

	/**
	 * The owner of the notarization.
	 */
	@property({ type: "string" })
	public owner!: string;
}
