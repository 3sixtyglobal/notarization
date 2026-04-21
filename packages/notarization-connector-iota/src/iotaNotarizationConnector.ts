// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import { Transaction } from "@iota/iota-sdk/transactions";
import {
	NotarizationClient,
	NotarizationClientReadOnly,
	State,
	TimeLock,
	type LockMetadata,
	type OnChainNotarization
} from "@iota/notarization/node/index.js";
import { Coerce, ComponentFactory, GeneralError, Guards, Is, Urn } from "@twin.org/core";
import { type IIotaTransactionBlockResponse, Iota } from "@twin.org/dlt-iota";
import type { ILoggingComponent } from "@twin.org/logging-models";
import { nameof } from "@twin.org/nameof";
import type { INotarization, INotarizationConnector } from "@twin.org/notarization-models";
import { NotarizationMode } from "@twin.org/notarization-models";
import { VaultConnectorFactory, type IVaultConnector } from "@twin.org/vault-models";
import { WalletConnectorFactory, type IWalletConnector } from "@twin.org/wallet-models";
import type { IIotaNotarizationConnectorConfig } from "./models/IIotaNotarizationConnectorConfig.js";
import type { IIotaNotarizationConnectorConstructorOptions } from "./models/IIotaNotarizationConnectorConstructorOptions.js";

/**
 * Dummy IOTA connector for notarization scaffolding.
 */
export class IotaNotarizationConnector implements INotarizationConnector {
	/**
	 * The namespace supported by the connector.
	 */
	public static readonly NAMESPACE: string = "iota";

	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<IotaNotarizationConnector>();

	/**
	 * The connector configuration.
	 * @internal
	 */
	private readonly _config: IIotaNotarizationConnectorConfig;

	/**
	 * The vault connector.
	 * @internal
	 */
	private readonly _vaultConnector: IVaultConnector;

	/**
	 * The wallet connector.
	 * @internal
	 */
	private readonly _walletConnector: IWalletConnector;

	/**
	 * The logging component.
	 * @internal
	 */
	private readonly _logging?: ILoggingComponent;

	/**
	 * Create a new instance of IotaNotarizationConnector.
	 * @param options The options for the connector.
	 */
	constructor(options: IIotaNotarizationConnectorConstructorOptions) {
		Guards.object(IotaNotarizationConnector.CLASS_NAME, nameof(options), options);
		Guards.object(IotaNotarizationConnector.CLASS_NAME, nameof(options.config), options.config);
		this._config = options.config;
		Iota.populateConfig(this._config);
		this._vaultConnector = VaultConnectorFactory.get(options.vaultConnectorType ?? "vault");
		this._walletConnector = WalletConnectorFactory.get(options.walletConnectorType ?? "wallet");
		this._logging = ComponentFactory.getIfExists(options?.loggingComponentType ?? "logging");
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return IotaNotarizationConnector.CLASS_NAME;
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
			IotaNotarizationConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.object(IotaNotarizationConnector.CLASS_NAME, nameof(notarization), notarization);

		try {
			const notarizationClient = await this.buildWritableClient(controllerIdentity);

			if (notarization.mode === NotarizationMode.Locked) {
				let tx = notarizationClient
					.createLocked()
					.withBytesState(notarization.data, notarization.description)
					.withImmutableDescription(notarization.immutableDescription)
					.withUpdatableMetadata(notarization.description);

				if (!Is.empty(notarization.deleteLockDateTime)) {
					const unlockAt = this.toUnixSeconds(notarization.deleteLockDateTime);
					tx = tx.withDeleteLock(TimeLock.withUnlockAt(unlockAt));
				}

				const result = await this.postTransaction(
					controllerIdentity,
					tx.finish(),
					notarizationClient,
					"create"
				);
				return this.toNotarizationId(this.extractCreatedObjectId(result));
			}

			let tx = notarizationClient
				.createDynamic()
				.withBytesState(notarization.data, notarization.description)
				.withImmutableDescription(notarization.immutableDescription)
				.withUpdatableMetadata(notarization.description);

			if (
				notarization.transferLockUntilDestroyed === true ||
				!Is.empty(notarization.transferLockDateTime)
			) {
				tx = tx.withTransferLock(
					this.toTimeLock(
						notarization.transferLockUntilDestroyed,
						notarization.transferLockDateTime
					)
				);
			}

			const result = await this.postTransaction(
				controllerIdentity,
				tx.finish(),
				notarizationClient,
				"create"
			);

			return this.toNotarizationId(this.extractCreatedObjectId(result));
		} catch (error) {
			throw new GeneralError(
				IotaNotarizationConnector.CLASS_NAME,
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
		Urn.guard(IotaNotarizationConnector.CLASS_NAME, nameof(id), id);

		const objectId = this.objectIdFromUrn(id);

		try {
			const readOnlyClient = await this.buildReadOnlyClient();
			const onChainNotarization = await readOnlyClient.getNotarizationById(objectId);
			return this.mapToNotarization(id, onChainNotarization);
		} catch (error) {
			throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "getFailed", undefined, error);
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
			IotaNotarizationConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(IotaNotarizationConnector.CLASS_NAME, nameof(id), id);

		const objectId = this.objectIdFromUrn(id);

		try {
			const notarizationClient = await this.buildWritableClient(controllerIdentity);
			const readOnlyClient = notarizationClient.readOnly();

			const canDestroy = await readOnlyClient.isDestroyAllowed(objectId);
			if (!canDestroy) {
				throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "deleteLockActive");
			}

			await this.postTransaction(
				controllerIdentity,
				notarizationClient.destroy(objectId),
				notarizationClient,
				"remove"
			);
		} catch (error) {
			throw new GeneralError(
				IotaNotarizationConnector.CLASS_NAME,
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
			IotaNotarizationConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Guards.object(IotaNotarizationConnector.CLASS_NAME, nameof(notarization), notarization);
		Urn.guard(IotaNotarizationConnector.CLASS_NAME, nameof(notarization.id), notarization.id);

		const objectId = this.objectIdFromUrn(notarization.id);

		try {
			const notarizationClient = await this.buildWritableClient(controllerIdentity);
			const readOnlyClient = notarizationClient.readOnly();

			const isUpdateLocked = await readOnlyClient.isUpdateLocked(objectId);
			if (isUpdateLocked) {
				throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "updateLockActive");
			}

			await this.postTransaction(
				controllerIdentity,
				notarizationClient.updateState(
					State.fromBytes(notarization.data, notarization.description),
					objectId
				),
				notarizationClient,
				"update"
			);
		} catch (error) {
			throw new GeneralError(
				IotaNotarizationConnector.CLASS_NAME,
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
			IotaNotarizationConnector.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);
		Urn.guard(IotaNotarizationConnector.CLASS_NAME, nameof(id), id);
		Guards.stringValue(
			IotaNotarizationConnector.CLASS_NAME,
			nameof(recipientAddress),
			recipientAddress
		);

		const objectId = this.objectIdFromUrn(id);

		try {
			const notarizationClient = await this.buildWritableClient(controllerIdentity);
			const readOnlyClient = notarizationClient.readOnly();

			const isTransferLocked = await readOnlyClient.isTransferLocked(objectId);
			if (isTransferLocked) {
				throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "transferLockActive");
			}

			await this.postTransaction(
				controllerIdentity,
				notarizationClient.transferNotarization(objectId, recipientAddress),
				notarizationClient,
				"transfer"
			);
		} catch (error) {
			throw new GeneralError(
				IotaNotarizationConnector.CLASS_NAME,
				"transferFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Build a read-only notarization client.
	 * @returns The notarization read-only client.
	 * @internal
	 */
	private async buildReadOnlyClient(): Promise<NotarizationClientReadOnly> {
		const iotaClient = Iota.createClient(this._config);
		return NotarizationClientReadOnly.create(
			iotaClient as unknown as Parameters<typeof NotarizationClientReadOnly.create>[0]
		);
	}

	/**
	 * Build a writable notarization client for an identity.
	 * @param controllerIdentity The controller identity.
	 * @returns The notarization writable client.
	 * @internal
	 */
	private async buildWritableClient(controllerIdentity: string): Promise<NotarizationClient> {
		const readOnlyClient = await this.buildReadOnlyClient();
		const address = await this.getControllerAddress(controllerIdentity);

		const seed = await Iota.getSeed(this._config, this._vaultConnector, controllerIdentity);
		const keyPair = Iota.getKeyPair(
			seed,
			this._config.coinType ?? Iota.DEFAULT_COIN_TYPE,
			0,
			this._config.walletAddressIndex ?? 0
		);
		const signerKeyPair = new Ed25519Keypair({
			publicKey: keyPair.publicKey,
			secretKey: keyPair.privateKey
		});

		const signer = {
			sign: async (txDataBcs: Uint8Array): Promise<string> =>
				(await signerKeyPair.signTransaction(txDataBcs)).signature,
			publicKey: async () => signerKeyPair.getPublicKey(),
			iotaPublicKeyBytes: async () => signerKeyPair.getPublicKey().toIotaBytes(),
			keyId: () => address
		};

		return NotarizationClient.create(readOnlyClient, signer);
	}

	/**
	 * Post a notarization transaction using the shared IOTA transaction flow.
	 *
	 * This builds the notarization transaction, posts it via Iota.prepareAndPostTransaction
	 * (which internally handles gas station mode when configured).
	 *
	 * @param controllerIdentity The identity performing the transaction.
	 * @param transactionBuilder The transaction builder.
	 * @param notarizationClient The notarization client.
	 * @param dryRunLabel An optional label for dry run transactions when cost logging is enabled.
	 * @returns The execution result.
	 * @internal
	 */
	private async postTransaction(
		controllerIdentity: string,
		transactionBuilder: {
			build: (client: NotarizationClient) => Promise<[Uint8Array, string[], unknown]>;
		},
		notarizationClient: NotarizationClient,
		dryRunLabel: string
	): Promise<IIotaTransactionBlockResponse> {
		const [txBytes] = await transactionBuilder.build(notarizationClient);
		const transaction = Transaction.from(txBytes);
		const owner = await this.getControllerAddress(controllerIdentity);
		const iotaClient = Iota.createClient(this._config);

		const response = await Iota.prepareAndPostTransaction(
			this._config,
			this._vaultConnector,
			this._logging,
			controllerIdentity,
			iotaClient,
			owner,
			transaction,
			{
				dryRunLabel: this._config.enableCostLogging ? dryRunLabel : undefined
			}
		);

		this.handleAbortCode(response);

		return response;
	}

	/**
	 * Extract the created object id from transaction response object changes.
	 * @param result The posted transaction result.
	 * @returns The created object id.
	 * @internal
	 */
	private extractCreatedObjectId(result: { objectChanges?: unknown }): string {
		if (!Array.isArray(result.objectChanges)) {
			throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "creationFailedOutput");
		}

		const createdObject = result.objectChanges.find(
			(change): change is { type: string; objectId: string } =>
				Is.object(change) &&
				(change as { type?: unknown }).type === "created" &&
				Is.stringValue((change as { objectId?: unknown }).objectId)
		);

		if (Is.empty(createdObject)) {
			throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "creationFailedOutput");
		}

		return createdObject.objectId;
	}

	/**
	 * Get the address for the controller identity.
	 * @param controllerIdentity The identity.
	 * @returns The configured address.
	 * @internal
	 */
	private async getControllerAddress(controllerIdentity: string): Promise<string> {
		const addresses = await this._walletConnector.getAddresses(
			controllerIdentity,
			0,
			this._config.walletAddressIndex ?? 0,
			1
		);

		return addresses[0];
	}

	/**
	 * Parse and validate a notarization id into the underlying object id.
	 * @param id The notarization id.
	 * @returns The object id.
	 * @internal
	 */
	private objectIdFromUrn(id: string): string {
		const urnParsed = Urn.fromValidString(id);
		if (urnParsed.namespaceMethod() !== IotaNotarizationConnector.NAMESPACE) {
			throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "namespaceMismatch", {
				namespace: IotaNotarizationConnector.NAMESPACE,
				id
			});
		}

		return urnParsed.namespaceSpecific(1);
	}

	/**
	 * Format an object id as a notarization URN.
	 * @param objectId The object id.
	 * @returns The notarization id.
	 * @internal
	 */
	private toNotarizationId(objectId: string): string {
		return `notarization:${new Urn(IotaNotarizationConnector.NAMESPACE, objectId).toString()}`;
	}

	/**
	 * Convert a notarization lock into an IOTA time lock.
	 * @param lock The lock.
	 * @returns The IOTA time lock.
	 * @internal
	 */
	private toTimeLock(untilDestroyed?: boolean, dateTime?: string): TimeLock {
		if (untilDestroyed === true) {
			return TimeLock.withUntilDestroyed();
		}

		if (!Is.empty(dateTime)) {
			return TimeLock.withUnlockAt(this.toUnixSeconds(dateTime));
		}

		return TimeLock.withNone();
	}

	/**
	 * Convert an ISO date-time string to unix seconds.
	 * @param isoDateTime The ISO date-time.
	 * @returns The unix timestamp in seconds.
	 * @internal
	 */
	private toUnixSeconds(isoDateTime: string): number {
		const dateValue = Coerce.dateTime(isoDateTime);
		if (Is.empty(dateValue)) {
			throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "invalidDate", {
				value: isoDateTime
			});
		}

		return Math.floor(dateValue.getTime() / 1000);
	}

	/**
	 * Convert an IOTA lock metadata object to local lock fields.
	 * @param lockMetadata The lock metadata.
	 * @returns The mapped lock fields.
	 * @internal
	 */
	private mapLocks(
		lockMetadata: LockMetadata | undefined
	): Pick<
		INotarization,
		"deleteLockDateTime" | "transferLockUntilDestroyed" | "transferLockDateTime"
	> {
		if (Is.empty(lockMetadata)) {
			return {
				deleteLockDateTime: undefined,
				transferLockUntilDestroyed: undefined,
				transferLockDateTime: undefined
			};
		}

		const deleteLockDateTime =
			lockMetadata.deleteLock.type === "UnlockAt"
				? new Date(Number(lockMetadata.deleteLock.args) * 1000).toISOString()
				: undefined;

		const transferLockUntilDestroyed =
			lockMetadata.transferLock.type === "UntilDestroyed" ? true : undefined;

		const transferLockDateTime =
			lockMetadata.transferLock.type === "UnlockAt"
				? new Date(Number(lockMetadata.transferLock.args) * 1000).toISOString()
				: undefined;

		return {
			deleteLockDateTime,
			transferLockUntilDestroyed,
			transferLockDateTime
		};
	}

	/**
	 * Map an on-chain notarization to the local model.
	 * @param id The local notarization id.
	 * @param onChainNotarization The on-chain notarization.
	 * @returns The mapped local notarization.
	 * @internal
	 */
	private mapToNotarization(id: string, onChainNotarization: OnChainNotarization): INotarization {
		const locks = this.mapLocks(onChainNotarization.immutableMetadata.locking);

		return {
			id,
			mode:
				onChainNotarization.method === "Dynamic"
					? NotarizationMode.Dynamic
					: NotarizationMode.Locked,
			dateCreated: new Date(
				Number(onChainNotarization.immutableMetadata.createdAt) * 1000
			).toISOString(),
			dateModified: new Date(Number(onChainNotarization.lastStateChangeAt)).toISOString(),
			data: onChainNotarization.state.data.toBytes(),
			description: onChainNotarization.state.metadata ?? onChainNotarization.updatableMetadata,
			immutableDescription: onChainNotarization.immutableMetadata.description,
			...locks
		};
	}

	/**
	 * Handles an abort code from a transaction result if the transaction was aborted.
	 * @param response The transaction result to handle the abort code from.
	 * @internal
	 */
	private handleAbortCode(response: IIotaTransactionBlockResponse): void {
		if (
			response.effects?.status?.status === "failure" &&
			Is.stringValue(response.effects.status.error)
		) {
			const match = /abort code: (\d+)/.exec(response.effects.status.error);
			if (match) {
				const abortCode = match[1];

				if (abortCode === "0") {
					throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "updateWhileLocked");
				} else if (abortCode === "1") {
					throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "destroyWhileLocked");
				} else if (abortCode === "2") {
					throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "lockTimeNotSatisfied");
				} else if (abortCode === "3") {
					throw new GeneralError(
						IotaNotarizationConnector.CLASS_NAME,
						"untilDestroyedLockNotAllowed"
					);
				} else if (abortCode === "4") {
					throw new GeneralError(
						IotaNotarizationConnector.CLASS_NAME,
						"dynamicNotarizationInvariants"
					);
				} else if (abortCode === "5") {
					throw new GeneralError(
						IotaNotarizationConnector.CLASS_NAME,
						"lockedNotarizationInvariants"
					);
				} else {
					throw new GeneralError(IotaNotarizationConnector.CLASS_NAME, "unknownAbortCode", {
						abortCode
					});
				}
			}
		}
	}
}
