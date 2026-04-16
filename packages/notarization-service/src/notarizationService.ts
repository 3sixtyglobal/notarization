// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { GeneralError, Guards, Urn } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import {
	NotarizationConnectorFactory,
	type INotarization,
	type INotarizationComponent,
	type INotarizationConnector
} from "@twin.org/notarization-models";
import type { INotarizationServiceConstructorOptions } from "./models/INotarizationServiceConstructorOptions.js";

/**
 * Service for notarization operations.
 */
export class NotarizationService implements INotarizationComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<NotarizationService>();

	/**
	 * The namespace supported by the notarization service.
	 * @internal
	 */
	private static readonly _NAMESPACE: string = "notarization";

	/**
	 * The default namespace for the connector to use.
	 * @internal
	 */
	private readonly _defaultNamespace: string;

	/**
	 * Create a new instance of NotarizationService.
	 * @param options The constructor options.
	 */
	constructor(options?: INotarizationServiceConstructorOptions) {
		const names = NotarizationConnectorFactory.names();
		if (names.length === 0) {
			throw new GeneralError(NotarizationService.CLASS_NAME, "noConnectors");
		}

		this._defaultNamespace = options?.config?.defaultNamespace ?? names[0];
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return NotarizationService.CLASS_NAME;
	}

	/**
	 * Create a new notarization.
	 * @param notarization The notarization data without generated fields.
	 * @param namespace The namespace of the connector to use for the notarization, defaults to service configured namespace.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns The generated notarization id.
	 */
	public async create(
		notarization: Omit<INotarization, "id" | "dateCreated">,
		namespace?: string,
		controllerIdentity?: string
	): Promise<string> {
		Guards.object(NotarizationService.CLASS_NAME, nameof(notarization), notarization);
		if (namespace !== undefined) {
			Guards.stringValue(NotarizationService.CLASS_NAME, nameof(namespace), namespace);
		}
		Guards.stringValue(
			NotarizationService.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);

		try {
			const connectorNamespace = namespace ?? this._defaultNamespace;

			const notarizationConnector =
				NotarizationConnectorFactory.get<INotarizationConnector>(connectorNamespace);

			const notarizationId = await notarizationConnector.create(controllerIdentity, notarization);

			return notarizationId;
		} catch (error) {
			throw new GeneralError(NotarizationService.CLASS_NAME, "createFailed", undefined, error);
		}
	}

	/**
	 * Get an existing notarization.
	 * @param id The id of the notarization to get.
	 * @returns The notarization.
	 */
	public async get(id: string): Promise<INotarization> {
		Urn.guard(NotarizationService.CLASS_NAME, nameof(id), id);

		try {
			const notarizationConnector = this.getConnector(id);
			const result = await notarizationConnector.get(id);

			return result;
		} catch (error) {
			throw new GeneralError(NotarizationService.CLASS_NAME, "getFailed", undefined, error);
		}
	}

	/**
	 * Remove an existing notarization.
	 * @param id The id of the notarization to remove.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns Nothing.
	 */
	public async remove(id: string, controllerIdentity?: string): Promise<void> {
		Urn.guard(NotarizationService.CLASS_NAME, nameof(id), id);
		Guards.stringValue(
			NotarizationService.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);

		try {
			const notarizationConnector = this.getConnector(id);
			await notarizationConnector.remove(controllerIdentity, id);
		} catch (error) {
			throw new GeneralError(NotarizationService.CLASS_NAME, "removeFailed", undefined, error);
		}
	}

	/**
	 * Update an existing notarization.
	 * @param notarization The notarization to update.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns Nothing.
	 */
	public async update(notarization: INotarization, controllerIdentity?: string): Promise<void> {
		Guards.object(NotarizationService.CLASS_NAME, nameof(notarization), notarization);
		Urn.guard(NotarizationService.CLASS_NAME, nameof(notarization.id), notarization.id);
		Guards.stringValue(
			NotarizationService.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);

		try {
			const notarizationConnector = this.getConnector(notarization.id);
			await notarizationConnector.update(controllerIdentity, notarization);
		} catch (error) {
			throw new GeneralError(NotarizationService.CLASS_NAME, "updateFailed", undefined, error);
		}
	}

	/**
	 * Transfer an existing notarization.
	 * @param id The id of the notarization to transfer.
	 * @param recipientAddress The recipient address.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns Nothing.
	 */
	public async transfer(
		id: string,
		recipientAddress: string,
		controllerIdentity?: string
	): Promise<void> {
		Urn.guard(NotarizationService.CLASS_NAME, nameof(id), id);
		Guards.stringValue(NotarizationService.CLASS_NAME, nameof(recipientAddress), recipientAddress);
		Guards.stringValue(
			NotarizationService.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);

		try {
			const notarizationConnector = this.getConnector(id);
			await notarizationConnector.transfer(controllerIdentity, id, recipientAddress);
		} catch (error) {
			throw new GeneralError(NotarizationService.CLASS_NAME, "transferFailed", undefined, error);
		}
	}

	/**
	 * Get the connector from the id.
	 * @param id The id of the notarization in urn format.
	 * @returns The connector.
	 * @internal
	 */
	private getConnector(id: string): INotarizationConnector {
		const idUrn = Urn.fromValidString(id);

		if (idUrn.namespaceIdentifier() !== NotarizationService._NAMESPACE) {
			throw new GeneralError(NotarizationService.CLASS_NAME, "namespaceMismatch", {
				namespace: NotarizationService._NAMESPACE,
				id
			});
		}

		return NotarizationConnectorFactory.get<INotarizationConnector>(idUrn.namespaceMethod());
	}
}
