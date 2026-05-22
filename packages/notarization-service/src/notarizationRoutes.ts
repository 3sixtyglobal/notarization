// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type {
	ICreatedResponse,
	IHttpRequestContext,
	INoContentResponse,
	IRestRoute,
	ITag
} from "@twin.org/api-models";
import { ContextIdHelper, ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { Converter, ComponentFactory, Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import type {
	INotarizationComponent,
	INotarizationCreateRequest,
	INotarizationGetRequest,
	INotarizationGetResponse,
	INotarizationRemoveRequest,
	INotarizationTransferRequest,
	INotarizationUpdateRequest
} from "@twin.org/notarization-models";
import { HeaderTypes, HttpStatusCode } from "@twin.org/web";

/**
 * The source for the routes.
 */
const ROUTES_SOURCE = "notarizationRoutes";

/**
 * The tag to associate with the routes.
 */
export const tagsNotarization: ITag[] = [
	{
		name: "Notarization",
		description: "Endpoints which are modelled to access a notarization service."
	}
];

/**
 * The REST routes for notarization.
 * @param baseRouteName Prefix to prepend to the paths.
 * @param componentName The name of the component to use in the routes stored in the ComponentFactory.
 * @returns The generated routes.
 */
export function generateRestRoutesNotarization(
	baseRouteName: string,
	componentName: string
): IRestRoute[] {
	const createRoute: IRestRoute<INotarizationCreateRequest, ICreatedResponse> = {
		operationId: "notarizationCreate",
		summary: "Create a notarization",
		tag: tagsNotarization[0].name,
		method: "POST",
		path: `${baseRouteName}/`,
		handler: async (httpRequestContext, request) =>
			notarizationCreate(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<INotarizationCreateRequest>(),
			examples: [
				{
					id: "notarizationCreateExample",
					request: {
						body: {
							mode: "dynamic",
							data: "aGVsbG8gd29ybGQ=",
							description: "My first notarization"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ICreatedResponse>(),
				examples: [
					{
						id: "notarizationCreateResponseExample",
						response: {
							statusCode: HttpStatusCode.created,
							headers: {
								[HeaderTypes.Location]: "123"
							}
						}
					}
				]
			}
		]
	};

	const removeRoute: IRestRoute<INotarizationRemoveRequest, INoContentResponse> = {
		operationId: "notarizationRemove",
		summary: "Remove a notarization",
		tag: tagsNotarization[0].name,
		method: "DELETE",
		path: `${baseRouteName}/:id`,
		handler: async (httpRequestContext, request) =>
			notarizationRemove(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<INotarizationRemoveRequest>(),
			examples: [
				{
					id: "notarizationRemoveExample",
					request: {
						pathParams: {
							id: "123"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>(),
				examples: [
					{
						id: "notarizationRemoveResponseExample",
						response: {
							statusCode: HttpStatusCode.noContent
						}
					}
				]
			}
		]
	};

	const getRoute: IRestRoute<INotarizationGetRequest, INotarizationGetResponse> = {
		operationId: "notarizationGet",
		summary: "Get a notarization",
		tag: tagsNotarization[0].name,
		method: "GET",
		path: `${baseRouteName}/:id`,
		handler: async (httpRequestContext, request) =>
			notarizationGet(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<INotarizationGetRequest>(),
			examples: [
				{
					id: "notarizationGetExample",
					request: {
						pathParams: {
							id: "123"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INotarizationGetResponse>(),
				examples: [
					{
						id: "notarizationGetResponseExample",
						response: {
							body: {
								id: "123",
								mode: "dynamic",
								dateCreated: "2026-01-01T00:00:00.000Z",
								data: "aGVsbG8gd29ybGQ=",
								description: "A notarization"
							}
						}
					}
				]
			}
		]
	};

	const updateRoute: IRestRoute<INotarizationUpdateRequest, INoContentResponse> = {
		operationId: "notarizationUpdate",
		summary: "Update a notarization",
		tag: tagsNotarization[0].name,
		method: "PUT",
		path: `${baseRouteName}/:id`,
		handler: async (httpRequestContext, request) =>
			notarizationUpdate(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<INotarizationUpdateRequest>(),
			examples: [
				{
					id: "notarizationUpdateExample",
					request: {
						pathParams: {
							id: "123"
						},
						body: {
							id: "123",
							mode: "dynamic",
							dateCreated: "2026-01-01T00:00:00.000Z",
							data: "aGVsbG8gd29ybGQ=",
							description: "Updated notarization"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>(),
				examples: [
					{
						id: "notarizationUpdateResponseExample",
						response: {
							statusCode: HttpStatusCode.noContent
						}
					}
				]
			}
		]
	};

	const transferRoute: IRestRoute<INotarizationTransferRequest, INoContentResponse> = {
		operationId: "notarizationTransfer",
		summary: "Transfer a notarization",
		tag: tagsNotarization[0].name,
		method: "POST",
		path: `${baseRouteName}/:id/transfer`,
		handler: async (httpRequestContext, request) =>
			notarizationTransfer(httpRequestContext, componentName, request),
		requestType: {
			type: nameof<INotarizationTransferRequest>(),
			examples: [
				{
					id: "notarizationTransferExample",
					request: {
						pathParams: {
							id: "123"
						},
						body: {
							recipientAddress: "recipient-address-1"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>(),
				examples: [
					{
						id: "notarizationTransferResponseExample",
						response: {
							statusCode: HttpStatusCode.noContent
						}
					}
				]
			}
		]
	};

	return [createRoute, getRoute, removeRoute, updateRoute, transferRoute];
}

/**
 * Perform the create notarization operation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function notarizationCreate(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: INotarizationCreateRequest
): Promise<ICreatedResponse> {
	Guards.object<INotarizationCreateRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<INotarizationCreateRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<INotarizationComponent>(componentName);
	const { namespace, data, ...notarization } = request.body;
	const result = await component.create(
		{
			...notarization,
			data: Converter.base64ToBytes(data)
		},
		namespace,
		contextIds[ContextIdKeys.Organization]
	);
	return {
		statusCode: HttpStatusCode.created,
		headers: {
			[HeaderTypes.Location]: result
		}
	};
}

/**
 * Perform the remove notarization operation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function notarizationRemove(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: INotarizationRemoveRequest
): Promise<INoContentResponse> {
	Guards.object<INotarizationRemoveRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<INotarizationRemoveRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<INotarizationComponent>(componentName);
	await component.remove(request.pathParams.id, contextIds[ContextIdKeys.Organization]);

	return {
		statusCode: HttpStatusCode.noContent
	};
}

/**
 * Perform the get notarization operation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function notarizationGet(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: INotarizationGetRequest
): Promise<INotarizationGetResponse> {
	Guards.object<INotarizationGetRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<INotarizationGetRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);

	const component = ComponentFactory.get<INotarizationComponent>(componentName);

	const result = await component.get(request.pathParams.id);

	return {
		body: {
			...result,
			data: Converter.bytesToBase64(result.data)
		}
	};
}

/**
 * Perform the update notarization operation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function notarizationUpdate(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: INotarizationUpdateRequest
): Promise<INoContentResponse> {
	Guards.object<INotarizationUpdateRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<INotarizationUpdateRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);
	Guards.object<INotarizationUpdateRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<INotarizationComponent>(componentName);
	await component.update(
		{
			...request.body,
			data: Converter.base64ToBytes(request.body.data),
			id: request.pathParams.id
		},
		contextIds[ContextIdKeys.Organization]
	);

	return {
		statusCode: HttpStatusCode.noContent
	};
}

/**
 * Perform the transfer notarization operation.
 * @param httpRequestContext The request context for the API.
 * @param componentName The name of the component to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function notarizationTransfer(
	httpRequestContext: IHttpRequestContext,
	componentName: string,
	request: INotarizationTransferRequest
): Promise<INoContentResponse> {
	Guards.object<INotarizationTransferRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<INotarizationTransferRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);
	Guards.object<INotarizationTransferRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);
	Guards.stringValue(
		ROUTES_SOURCE,
		nameof(request.body.recipientAddress),
		request.body.recipientAddress
	);

	const contextIds = await ContextIdStore.getContextIds();
	ContextIdHelper.guard(contextIds, ContextIdKeys.Organization);

	const component = ComponentFactory.get<INotarizationComponent>(componentName);
	await component.transfer(
		request.pathParams.id,
		request.body.recipientAddress,
		contextIds[ContextIdKeys.Organization]
	);

	return {
		statusCode: HttpStatusCode.noContent
	};
}
