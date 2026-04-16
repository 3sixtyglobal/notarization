// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import type {
	IBaseRestClientConfig,
	ICreatedResponse,
	INoContentResponse
} from "@twin.org/api-models";
import { Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import type {
	INotarization,
	INotarizationComponent,
	INotarizationCreateRequest,
	INotarizationGetRequest,
	INotarizationGetResponse,
	INotarizationRemoveRequest,
	INotarizationTransferRequest,
	INotarizationUpdateRequest
} from "@twin.org/notarization-models";
import { HeaderTypes } from "@twin.org/web";

/**
 * Client for performing notarization operations through to REST endpoints.
 */
export class NotarizationRestClient extends BaseRestClient implements INotarizationComponent {
	/**
	 * Runtime name for the class.
	 */
	public static readonly CLASS_NAME: string = nameof<NotarizationRestClient>();

	/**
	 * Create a new instance of NotarizationRestClient.
	 * @param config The configuration for the client.
	 */
	constructor(config: IBaseRestClientConfig) {
		super(nameof<NotarizationRestClient>(), config, "notarization");
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return NotarizationRestClient.CLASS_NAME;
	}

	/**
	 * Create a new notarization.
	 * @param notarization The notarization data without generated fields.
	 * @param namespace The namespace of the connector to use for the notarization, defaults to service configured namespace.
	 * @returns The generated notarization id.
	 */
	public async create(
		notarization: Omit<INotarization, "id" | "dateCreated">,
		namespace?: string
	): Promise<string> {
		Guards.object(NotarizationRestClient.CLASS_NAME, nameof(notarization), notarization);

		const response = await this.fetch<INotarizationCreateRequest, ICreatedResponse>("/", "POST", {
			body: {
				...notarization,
				namespace
			}
		});

		const notarizationId = response.headers[HeaderTypes.Location];
		Guards.stringValue(NotarizationRestClient.CLASS_NAME, "location", notarizationId);

		return notarizationId;
	}

	/**
	 * Get an existing notarization.
	 * @param id The id of the notarization to get.
	 * @returns The notarization.
	 */
	public async get(id: string): Promise<INotarization> {
		Guards.stringValue(NotarizationRestClient.CLASS_NAME, nameof(id), id);
		const response = await this.fetch<INotarizationGetRequest, INotarizationGetResponse>(
			"/:id",
			"GET",
			{
				pathParams: { id }
			}
		);

		return response.body;
	}

	/**
	 * Remove an existing notarization.
	 * @param id The id of the notarization to remove.
	 */
	public async remove(id: string): Promise<void> {
		Guards.stringValue(NotarizationRestClient.CLASS_NAME, nameof(id), id);

		await this.fetch<INotarizationRemoveRequest, INoContentResponse>("/:id", "DELETE", {
			pathParams: { id }
		});
	}

	/**
	 * Update an existing notarization.
	 * @param notarization The notarization to update.
	 */
	public async update(notarization: INotarization): Promise<void> {
		Guards.object(NotarizationRestClient.CLASS_NAME, nameof(notarization), notarization);

		await this.fetch<INotarizationUpdateRequest, INoContentResponse>("/:id", "PUT", {
			pathParams: { id: notarization.id },
			body: notarization
		});
	}

	/**
	 * Transfer an existing notarization.
	 * @param id The id of the notarization to transfer.
	 * @param recipientAddress The recipient address.
	 */
	public async transfer(id: string, recipientAddress: string): Promise<void> {
		Guards.stringValue(NotarizationRestClient.CLASS_NAME, nameof(id), id);
		Guards.stringValue(
			NotarizationRestClient.CLASS_NAME,
			nameof(recipientAddress),
			recipientAddress
		);

		await this.fetch<INotarizationTransferRequest, INoContentResponse>("/:id/transfer", "POST", {
			pathParams: { id },
			body: { recipientAddress }
		});
	}
}
