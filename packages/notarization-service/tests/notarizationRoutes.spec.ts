// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IHttpRequestContext } from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import { Converter, ComponentFactory, Factory } from "@twin.org/core";
import {
	NotarizationConnectorFactory,
	type INotarization,
	type INotarizationComponent
} from "@twin.org/notarization-models";
import {
	generateRestRoutesNotarization,
	notarizationCreate,
	notarizationGet,
	notarizationRemove,
	notarizationTransfer,
	notarizationUpdate
} from "../src/notarizationRoutes.js";

const COMPONENT_NAME = "test-notarization-component";
const ORG_IDENTITY = "did:test:org-controller";
const NOTARIZATION_ID = "notarization:default-connector:abc123";
const MOCK_CONTEXT = {} as IHttpRequestContext;

const SAMPLE_NOTARIZATION: INotarization = {
	id: NOTARIZATION_ID,
	mode: "dynamic",
	dateCreated: "2026-01-01T00:00:00.000Z",
	data: new Uint8Array([1, 2, 3]),
	description: "Test notarization"
};

class MockNotarizationComponent implements INotarizationComponent {
	public createdId: string;

	public storedNotarization: INotarization;

	constructor() {
		this.createdId = NOTARIZATION_ID;
		this.storedNotarization = SAMPLE_NOTARIZATION;
	}

	public className(): string {
		return "MockNotarizationComponent";
	}

	public async create(
		notarization: Omit<INotarization, "id" | "dateCreated">,
		namespace?: string,
		controllerIdentity?: string
	): Promise<string> {
		return this.createdId;
	}

	public async get(id: string): Promise<INotarization> {
		return this.storedNotarization;
	}

	public async remove(id: string, controllerIdentity?: string): Promise<void> {}

	public async update(notarization: INotarization, controllerIdentity?: string): Promise<void> {}

	public async transfer(
		id: string,
		recipientAddress: string,
		controllerIdentity?: string
	): Promise<void> {}
}

describe("notarizationRoutes", () => {
	afterEach(() => {
		Factory.clearFactories();
	});

	function registerMockComponent(): MockNotarizationComponent {
		NotarizationConnectorFactory.register("default-connector", () => ({
			className: () => "stub",
			create: async () => NOTARIZATION_ID,
			get: async () => SAMPLE_NOTARIZATION,
			remove: async () => {},
			update: async () => {},
			transfer: async () => {}
		}));
		const mock = new MockNotarizationComponent();
		ComponentFactory.register(COMPONENT_NAME, () => mock);
		return mock;
	}

	describe("generateRestRoutesNotarization", () => {
		test("returns all five routes", () => {
			registerMockComponent();
			const routes = generateRestRoutesNotarization("/notarization", COMPONENT_NAME);
			expect(routes).toHaveLength(5);
		});

		test("routes have correct operationIds", () => {
			registerMockComponent();
			const routes = generateRestRoutesNotarization("/notarization", COMPONENT_NAME);
			const ids = routes.map(r => r.operationId);
			expect(ids).toContain("notarizationCreate");
			expect(ids).toContain("notarizationGet");
			expect(ids).toContain("notarizationRemove");
			expect(ids).toContain("notarizationUpdate");
			expect(ids).toContain("notarizationTransfer");
		});

		test("create route has correct method and path", () => {
			registerMockComponent();
			const routes = generateRestRoutesNotarization("/notarization", COMPONENT_NAME);
			const route = routes.find(r => r.operationId === "notarizationCreate");
			expect(route?.method).toBe("POST");
			expect(route?.path).toBe("/notarization/");
		});

		test("get route has correct method and path", () => {
			registerMockComponent();
			const routes = generateRestRoutesNotarization("/notarization", COMPONENT_NAME);
			const route = routes.find(r => r.operationId === "notarizationGet");
			expect(route?.method).toBe("GET");
			expect(route?.path).toBe("/notarization/:id");
		});
	});

	describe("notarizationCreate", () => {
		test("creates a notarization and returns location header", async () => {
			registerMockComponent();
			const response = await ContextIdStore.run(
				{ [ContextIdKeys.Organization]: ORG_IDENTITY },
				async () =>
					notarizationCreate(MOCK_CONTEXT, COMPONENT_NAME, {
						body: {
							mode: "dynamic",
							data: Converter.bytesToBase64(new Uint8Array([1, 2, 3])),
							description: "test"
						}
					})
			);

			expect(response.statusCode).toBe(201);
			expect(response.headers?.location).toBe(encodeURIComponent(NOTARIZATION_ID));
		});

		test("creates a notarization with explicit namespace", async () => {
			registerMockComponent();
			const response = await ContextIdStore.run(
				{ [ContextIdKeys.Organization]: ORG_IDENTITY },
				async () =>
					notarizationCreate(MOCK_CONTEXT, COMPONENT_NAME, {
						body: {
							mode: "dynamic",
							data: Converter.bytesToBase64(new Uint8Array()),
							namespace: "default-connector"
						}
					})
			);

			expect(response.statusCode).toBe(201);
			expect(response.headers?.location).toBe(encodeURIComponent(NOTARIZATION_ID));
		});

		test("throws when request body is missing", async () => {
			registerMockComponent();
			await expect(
				ContextIdStore.run({ [ContextIdKeys.Organization]: ORG_IDENTITY }, async () =>
					notarizationCreate(MOCK_CONTEXT, COMPONENT_NAME, {} as never)
				)
			).rejects.toThrow();
		});

		test("throws when organization identity is not in context", async () => {
			registerMockComponent();
			await expect(
				notarizationCreate(MOCK_CONTEXT, COMPONENT_NAME, {
					body: { mode: "dynamic", data: Converter.bytesToBase64(new Uint8Array()) }
				})
			).rejects.toThrow();
		});
	});

	describe("notarizationGet", () => {
		test("returns the notarization body", async () => {
			registerMockComponent();
			const response = await notarizationGet(MOCK_CONTEXT, COMPONENT_NAME, {
				pathParams: { id: NOTARIZATION_ID }
			});

			expect(response.body).toBeDefined();
			expect(response.body.id).toBe(NOTARIZATION_ID);
		});

		test("throws when path params are missing", async () => {
			registerMockComponent();
			await expect(notarizationGet(MOCK_CONTEXT, COMPONENT_NAME, {} as never)).rejects.toThrow();
		});

		test("throws when id is empty", async () => {
			registerMockComponent();
			await expect(
				notarizationGet(MOCK_CONTEXT, COMPONENT_NAME, { pathParams: { id: "" } })
			).rejects.toThrow();
		});
	});

	describe("notarizationRemove", () => {
		test("removes a notarization and returns no content", async () => {
			registerMockComponent();
			const response = await ContextIdStore.run(
				{ [ContextIdKeys.Organization]: ORG_IDENTITY },
				async () =>
					notarizationRemove(MOCK_CONTEXT, COMPONENT_NAME, {
						pathParams: { id: NOTARIZATION_ID }
					})
			);

			expect(response.statusCode).toBe(204);
		});

		test("throws when path params are missing", async () => {
			registerMockComponent();
			await expect(
				ContextIdStore.run({ [ContextIdKeys.Organization]: ORG_IDENTITY }, async () =>
					notarizationRemove(MOCK_CONTEXT, COMPONENT_NAME, {} as never)
				)
			).rejects.toThrow();
		});

		test("throws when organization identity is not in context", async () => {
			registerMockComponent();
			await expect(
				notarizationRemove(MOCK_CONTEXT, COMPONENT_NAME, {
					pathParams: { id: NOTARIZATION_ID }
				})
			).rejects.toThrow();
		});
	});

	describe("notarizationUpdate", () => {
		test("updates a notarization and returns no content", async () => {
			registerMockComponent();
			const response = await ContextIdStore.run(
				{ [ContextIdKeys.Organization]: ORG_IDENTITY },
				async () =>
					notarizationUpdate(MOCK_CONTEXT, COMPONENT_NAME, {
						pathParams: { id: NOTARIZATION_ID },
						body: {
							...SAMPLE_NOTARIZATION,
							data: Converter.bytesToBase64(SAMPLE_NOTARIZATION.data)
						}
					})
			);

			expect(response.statusCode).toBe(204);
		});

		test("throws when path params are missing", async () => {
			registerMockComponent();
			await expect(
				ContextIdStore.run({ [ContextIdKeys.Organization]: ORG_IDENTITY }, async () =>
					notarizationUpdate(MOCK_CONTEXT, COMPONENT_NAME, {
						body: {
							...SAMPLE_NOTARIZATION,
							data: Converter.bytesToBase64(SAMPLE_NOTARIZATION.data)
						}
					} as never)
				)
			).rejects.toThrow();
		});

		test("throws when body is missing", async () => {
			registerMockComponent();
			await expect(
				ContextIdStore.run({ [ContextIdKeys.Organization]: ORG_IDENTITY }, async () =>
					notarizationUpdate(MOCK_CONTEXT, COMPONENT_NAME, {
						pathParams: { id: NOTARIZATION_ID }
					} as never)
				)
			).rejects.toThrow();
		});

		test("throws when organization identity is not in context", async () => {
			registerMockComponent();
			await expect(
				notarizationUpdate(MOCK_CONTEXT, COMPONENT_NAME, {
					pathParams: { id: NOTARIZATION_ID },
					body: {
						...SAMPLE_NOTARIZATION,
						data: Converter.bytesToBase64(SAMPLE_NOTARIZATION.data)
					}
				})
			).rejects.toThrow();
		});
	});

	describe("notarizationTransfer", () => {
		test("transfers a notarization and returns no content", async () => {
			registerMockComponent();
			const response = await ContextIdStore.run(
				{ [ContextIdKeys.Organization]: ORG_IDENTITY },
				async () =>
					notarizationTransfer(MOCK_CONTEXT, COMPONENT_NAME, {
						pathParams: { id: NOTARIZATION_ID },
						body: { recipientAddress: "recipient-address-1" }
					})
			);

			expect(response.statusCode).toBe(204);
		});

		test("throws when path params are missing", async () => {
			registerMockComponent();
			await expect(
				ContextIdStore.run({ [ContextIdKeys.Organization]: ORG_IDENTITY }, async () =>
					notarizationTransfer(MOCK_CONTEXT, COMPONENT_NAME, {
						body: { recipientAddress: "recipient-address-1" }
					} as never)
				)
			).rejects.toThrow();
		});

		test("throws when body is missing", async () => {
			registerMockComponent();
			await expect(
				ContextIdStore.run({ [ContextIdKeys.Organization]: ORG_IDENTITY }, async () =>
					notarizationTransfer(MOCK_CONTEXT, COMPONENT_NAME, {
						pathParams: { id: NOTARIZATION_ID }
					} as never)
				)
			).rejects.toThrow();
		});

		test("throws when recipientAddress is empty", async () => {
			registerMockComponent();
			await expect(
				ContextIdStore.run({ [ContextIdKeys.Organization]: ORG_IDENTITY }, async () =>
					notarizationTransfer(MOCK_CONTEXT, COMPONENT_NAME, {
						pathParams: { id: NOTARIZATION_ID },
						body: { recipientAddress: "" }
					})
				)
			).rejects.toThrow();
		});

		test("throws when organization identity is not in context", async () => {
			registerMockComponent();
			await expect(
				notarizationTransfer(MOCK_CONTEXT, COMPONENT_NAME, {
					pathParams: { id: NOTARIZATION_ID },
					body: { recipientAddress: "recipient-address-1" }
				})
			).rejects.toThrow();
		});
	});
});
