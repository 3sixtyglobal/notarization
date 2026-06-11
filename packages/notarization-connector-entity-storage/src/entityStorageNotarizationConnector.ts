// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	Coerce,
	ComponentFactory,
	Converter,
	GeneralError,
	Guards,
	Is,
	NotFoundError,
	RandomHelper,
	Urn
} from "@twin.org/core";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import type { ILoggingComponent } from "@twin.org/logging-models";
import { nameof } from "@twin.org/nameof";
import type { INotarization, INotarizationConnector } from "@twin.org/notarization-models";
import { NotarizationMode } from "@twin.org/notarization-models";
import type { Notarization } from "./entities/notarization.js";
import type { IEntityStorageNotarizationConnectorConstructorOptions } from "./models/IEntityStorageNotarizationConnectorConstructorOptions.js";

/**
 * Entity storage connector for notarization scaffolding.
 */
export class EntityStorageNotarizationConnector implements INotarizationConnector {
	/**
	 * The namespace supported by the connector.
	 */
	public static readonly NAMESPACE: string = "entity-storage";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<EntityStorageNotarizationConnector>();

	/**
	 * The entity storage for notarization records.
	 * @internal
	 */
	private readonly _notarizationEntityStorage: IEntityStorageConnector<Notarization>;

	/**
	 * The logging component.
	 * @internal
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-private-class-members
	private readonly _logging?: ILoggingComponent;

	/**
	 * Create a new instance of EntityStorageNotarizationConnector.
	 * @param options The options for the connector.
	 */
	constructor(options?: IEntityStorageNotarizationConnectorConstructorOptions) {
		this._notarizationEntityStorage = EntityStorageConnectorFactory.get<
			IEntityStorageConnector<Notarization>
		>(options?.notarizationEntityStorageType ?? "notarization");
		this._logging = ComponentFactory.getIfExists(options?.loggingComponentType);
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return EntityStorageNotarizationConnector.CLASS_NAME;
	}

	/**
	 * Create a new notarization.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @param notarization The notarization data without generated fields.
	 * @returns The generated notarization id.
	 */
	public async create(
		controllerIdentity: string,
		notarization: Omit<INotarization, "id" | "dateCreated">
	): Promise<string> {
		Guards.stringValue(
			EntityStorageNotarizationConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.object(
			EntityStorageNotarizationConnector.CLASS_NAME,
			nameof(notarization),
			notarization
		);
		Guards.stringValue(
			EntityStorageNotarizationConnector.CLASS_NAME,
			nameof(notarization.mode),
			notarization.mode
		);
		Guards.uint8Array(
			EntityStorageNotarizationConnector.CLASS_NAME,
			nameof(notarization.data),
			notarization.data
		);

		try {
			// Enforce locks based on notarization mode
			this.validateAndEnforceLocks(notarization);

			const notarizationId = RandomHelper.generateUuidV7("compact");

			const notarizationRecord: Notarization = {
				id: notarizationId,
				mode: notarization.mode,
				dateCreated: new Date(Date.now()).toISOString(),
				data: Converter.bytesToBase64(notarization.data),
				description: notarization.description,
				immutableDescription: notarization.immutableDescription,
				dateModified: notarization.dateModified,
				deleteLockDateTime: notarization.deleteLockDateTime,
				transferLockUntilDestroyed: notarization.transferLockUntilDestroyed,
				transferLockDateTime: notarization.transferLockDateTime,
				controllerIdentity,
				owner: controllerIdentity
			};

			await this._notarizationEntityStorage.set(notarizationRecord);

			return `notarization:${new Urn(EntityStorageNotarizationConnector.NAMESPACE, notarizationId).toString()}`;
		} catch (error) {
			throw new GeneralError(
				EntityStorageNotarizationConnector.CLASS_NAME,
				"creationFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Get an existing notarization.
	 * @param id The id of the notarization to get.
	 * @returns The notarization.
	 */
	public async get(id: string): Promise<INotarization> {
		Urn.guard(EntityStorageNotarizationConnector.CLASS_NAME, nameof(id), id);

		const urnParsed = Urn.fromValidString(id);
		if (urnParsed.namespaceMethod() !== EntityStorageNotarizationConnector.NAMESPACE) {
			throw new GeneralError(EntityStorageNotarizationConnector.CLASS_NAME, "namespaceMismatch", {
				namespace: EntityStorageNotarizationConnector.NAMESPACE,
				id
			});
		}

		try {
			const notarizationId = urnParsed.namespaceSpecific(1);
			const notarization = await this._notarizationEntityStorage.get(notarizationId);

			if (Is.empty(notarization)) {
				throw new NotFoundError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"notarizationNotFound"
				);
			}

			return {
				id,
				mode: notarization.mode,
				dateCreated: notarization.dateCreated,
				data: Converter.base64ToBytes(notarization.data),
				description: notarization.description,
				immutableDescription: notarization.immutableDescription,
				dateModified: notarization.dateModified,
				deleteLockDateTime: notarization.deleteLockDateTime,
				transferLockUntilDestroyed: notarization.transferLockUntilDestroyed,
				transferLockDateTime: notarization.transferLockDateTime
			};
		} catch (error) {
			throw new GeneralError(
				EntityStorageNotarizationConnector.CLASS_NAME,
				"getFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Remove an existing notarization.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @param id The id of the notarization to remove.
	 * @returns Nothing.
	 */
	public async remove(controllerIdentity: string, id: string): Promise<void> {
		Guards.stringValue(
			EntityStorageNotarizationConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(EntityStorageNotarizationConnector.CLASS_NAME, nameof(id), id);

		const urnParsed = Urn.fromValidString(id);
		if (urnParsed.namespaceMethod() !== EntityStorageNotarizationConnector.NAMESPACE) {
			throw new GeneralError(EntityStorageNotarizationConnector.CLASS_NAME, "namespaceMismatch", {
				namespace: EntityStorageNotarizationConnector.NAMESPACE,
				id
			});
		}

		try {
			const notarizationId = urnParsed.namespaceSpecific(1);
			const notarization = await this._notarizationEntityStorage.get(notarizationId);

			if (Is.empty(notarization)) {
				throw new NotFoundError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"notarizationNotFound"
				);
			}

			if (notarization.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"notControllerRemove"
				);
			}

			const lockDate = Coerce.dateTime(notarization.deleteLockDateTime);

			if (!Is.empty(lockDate) && lockDate.getTime() > Date.now()) {
				throw new GeneralError(EntityStorageNotarizationConnector.CLASS_NAME, "deleteLockActive", {
					unlockAt: notarization.deleteLockDateTime
				});
			}

			await this._notarizationEntityStorage.remove(notarizationId);
		} catch (error) {
			throw new GeneralError(
				EntityStorageNotarizationConnector.CLASS_NAME,
				"removeFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Update an existing notarization.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @param notarization The notarization to update.
	 * @returns Nothing.
	 */
	public async update(controllerIdentity: string, notarization: INotarization): Promise<void> {
		Guards.stringValue(
			EntityStorageNotarizationConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.object(
			EntityStorageNotarizationConnector.CLASS_NAME,
			nameof(notarization),
			notarization
		);
		Urn.guard(
			EntityStorageNotarizationConnector.CLASS_NAME,
			nameof(notarization.id),
			notarization.id
		);

		const urnParsed = Urn.fromValidString(notarization.id);
		if (urnParsed.namespaceMethod() !== EntityStorageNotarizationConnector.NAMESPACE) {
			throw new GeneralError(EntityStorageNotarizationConnector.CLASS_NAME, "namespaceMismatch", {
				namespace: EntityStorageNotarizationConnector.NAMESPACE,
				id: notarization.id
			});
		}

		try {
			const notarizationId = urnParsed.namespaceSpecific(1);
			const existingNotarization = await this._notarizationEntityStorage.get(notarizationId);

			if (Is.empty(existingNotarization)) {
				throw new NotFoundError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"notarizationNotFound"
				);
			}

			if (existingNotarization.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"notControllerUpdate"
				);
			}

			// Check if notarization is locked
			if (existingNotarization.mode === NotarizationMode.Locked) {
				throw new GeneralError(EntityStorageNotarizationConnector.CLASS_NAME, "updateLockActive");
			}

			// Verify immutable fields have not been modified
			if (existingNotarization.immutableDescription !== notarization.immutableDescription) {
				throw new GeneralError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"immutableFieldModification",
					{ field: "immutableDescription" }
				);
			}

			// Validate and enforce locks before storage
			const validationPayload: INotarization = {
				id: existingNotarization.id,
				mode: existingNotarization.mode,
				data: notarization.data,
				description: notarization.description,
				immutableDescription: existingNotarization.immutableDescription,
				dateCreated: existingNotarization.dateCreated,
				dateModified: new Date(Date.now()).toISOString(),
				deleteLockDateTime: notarization.deleteLockDateTime,
				transferLockUntilDestroyed: notarization.transferLockUntilDestroyed,
				transferLockDateTime: notarization.transferLockDateTime
			};

			this.validateAndEnforceLocks(validationPayload);

			// Update the notarization record with validated locks
			const updatedNotarization: Notarization = {
				...validationPayload,
				data: Converter.bytesToBase64(notarization.data),
				controllerIdentity: existingNotarization.controllerIdentity,
				owner: existingNotarization.owner
			};

			await this._notarizationEntityStorage.set(updatedNotarization);
		} catch (error) {
			throw new GeneralError(
				EntityStorageNotarizationConnector.CLASS_NAME,
				"updateFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Transfer an existing notarization.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @param id The id of the notarization to transfer.
	 * @param recipientAddress The recipient address.
	 * @returns Nothing.
	 */
	public async transfer(
		controllerIdentity: string,
		id: string,
		recipientAddress: string
	): Promise<void> {
		Guards.stringValue(
			EntityStorageNotarizationConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(EntityStorageNotarizationConnector.CLASS_NAME, nameof(id), id);
		Guards.stringValue(
			EntityStorageNotarizationConnector.CLASS_NAME,
			nameof(recipientAddress),
			recipientAddress
		);

		const urnParsed = Urn.fromValidString(id);
		if (urnParsed.namespaceMethod() !== EntityStorageNotarizationConnector.NAMESPACE) {
			throw new GeneralError(EntityStorageNotarizationConnector.CLASS_NAME, "namespaceMismatch", {
				namespace: EntityStorageNotarizationConnector.NAMESPACE,
				id
			});
		}

		try {
			const notarizationId = urnParsed.namespaceSpecific(1);
			const notarization = await this._notarizationEntityStorage.get(notarizationId);

			if (Is.empty(notarization)) {
				throw new NotFoundError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"notarizationNotFound"
				);
			}

			if (notarization.controllerIdentity !== controllerIdentity) {
				throw new GeneralError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"notControllerUpdate"
				);
			}

			// Check if transfer is locked
			if (notarization.transferLockUntilDestroyed === true) {
				throw new GeneralError(EntityStorageNotarizationConnector.CLASS_NAME, "transferLockActive");
			}
			const lockDate = Coerce.dateTime(notarization.transferLockDateTime);
			if (!Is.empty(lockDate) && lockDate.getTime() > Date.now()) {
				throw new GeneralError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"transferLockActive",
					{
						unlockAt: notarization.transferLockDateTime
					}
				);
			}

			await this._notarizationEntityStorage.set({
				...notarization,
				owner: recipientAddress
			});
		} catch (error) {
			throw new GeneralError(
				EntityStorageNotarizationConnector.CLASS_NAME,
				"transferFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Validates and enforces lock constraints based on notarization mode.
	 * @param notarization The notarization to validate and enforce locks on.
	 * @throws {GeneralError} If the lock constraints are invalid for the notarization mode.
	 * @internal
	 */
	private validateAndEnforceLocks(notarization: Omit<INotarization, "id" | "dateCreated">): void {
		if (notarization.mode === NotarizationMode.Locked) {
			// Locked notarizations can optionally have a valid UnlockAt delete date
			if (!Is.empty(notarization.deleteLockDateTime)) {
				const lockDate = Coerce.dateTime(notarization.deleteLockDateTime);
				if (Is.empty(lockDate)) {
					throw new GeneralError(
						EntityStorageNotarizationConnector.CLASS_NAME,
						"lockedNotarizationDeleteLockMustHaveDate"
					);
				}
			}

			// Locked notarizations cannot have transfer lock
			if (notarization.transferLockUntilDestroyed === false) {
				throw new GeneralError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"lockedNotarizationCannotHaveTransferLock"
				);
			}

			if (!Is.empty(notarization.transferLockDateTime)) {
				throw new GeneralError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"lockedNotarizationCannotHaveTransferLock"
				);
			}

			// Locked notarizations are always transfer-locked until destroyed.
			notarization.transferLockUntilDestroyed = true;
		} else if (notarization.mode === NotarizationMode.Dynamic) {
			// Dynamic notarizations cannot have delete lock
			if (!Is.empty(notarization.deleteLockDateTime)) {
				throw new GeneralError(
					EntityStorageNotarizationConnector.CLASS_NAME,
					"dynamicNotarizationCannotHaveDeleteLock"
				);
			}

			if (
				notarization.transferLockUntilDestroyed === true &&
				!Is.empty(notarization.transferLockDateTime)
			) {
				throw new GeneralError(EntityStorageNotarizationConnector.CLASS_NAME, "transferLockActive");
			}

			if (!Is.empty(notarization.transferLockDateTime)) {
				const transferLockDate = Coerce.dateTime(notarization.transferLockDateTime);
				if (Is.empty(transferLockDate)) {
					throw new GeneralError(
						EntityStorageNotarizationConnector.CLASS_NAME,
						"dynamicNotarizationTransferLockMustHaveDate"
					);
				}
			}
		}
	}
}
