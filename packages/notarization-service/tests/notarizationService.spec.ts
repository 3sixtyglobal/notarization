// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Factory } from "@twin.org/core";
import { EntityStorageNotarizationConnector } from "@twin.org/notarization-connector-entity-storage";
import {
	NotarizationConnectorFactory,
	type INotarization,
	type INotarizationConnector
} from "@twin.org/notarization-models";
import { NotarizationService } from "../src/notarizationService.js";

class TestNotarizationConnector implements INotarizationConnector {
	public readonly createResult: string;

	public readonly getResult: INotarization;

	public readonly removeCalls: { controllerIdentity: string; id: string }[];

	public readonly updateCalls: { controllerIdentity: string; notarization: INotarization }[];

	public readonly transferCalls: {
		controllerIdentity: string;
		id: string;
		recipientAddress: string;
	}[];

	public createError?: Error;

	public getError?: Error;

	public removeError?: Error;

	public updateError?: Error;

	public transferError?: Error;

	constructor(createResult: string) {
		this.createResult = createResult;
		this.getResult = {
			id: createResult,
			mode: "dynamic",
			dateCreated: "2026-01-01T00:00:00.000Z",
			data: new Uint8Array([1, 2, 3]),
			description: "from-test-connector"
		};
		this.removeCalls = [];
		this.updateCalls = [];
		this.transferCalls = [];
	}

	public className(): string {
		return "TestNotarizationConnector";
	}

	public async create(
		controllerIdentity: string,
		notarization: Omit<INotarization, "id" | "dateCreated">
	): Promise<string> {
		if (this.createError) {
			throw this.createError;
		}

		return this.createResult;
	}

	public async get(id: string): Promise<INotarization> {
		if (this.getError) {
			throw this.getError;
		}

		return {
			...this.getResult,
			id
		};
	}

	public async remove(controllerIdentity: string, id: string): Promise<void> {
		if (this.removeError) {
			throw this.removeError;
		}

		this.removeCalls.push({ controllerIdentity, id });
	}

	public async update(controllerIdentity: string, notarization: INotarization): Promise<void> {
		if (this.updateError) {
			throw this.updateError;
		}

		this.updateCalls.push({ controllerIdentity, notarization });
	}

	public async transfer(
		controllerIdentity: string,
		id: string,
		recipientAddress: string
	): Promise<void> {
		if (this.transferError) {
			throw this.transferError;
		}

		this.transferCalls.push({ controllerIdentity, id, recipientAddress });
	}
}

describe("NotarizationService", () => {
	afterEach(() => {
		Factory.clearFactories();
	});

	test("Can create an instance", async () => {
		NotarizationConnectorFactory.register(
			EntityStorageNotarizationConnector.NAMESPACE,
			() => new EntityStorageNotarizationConnector()
		);
		const service = new NotarizationService();
		expect(service).toBeDefined();
	});

	test("Can create using the default namespace", async () => {
		NotarizationConnectorFactory.register(
			"default-connector",
			() => new TestNotarizationConnector("notarization:urn:notarization:default-connector:1")
		);
		NotarizationConnectorFactory.register(
			"alternate-connector",
			() => new TestNotarizationConnector("notarization:urn:notarization:alternate-connector:1")
		);

		const service = new NotarizationService({
			config: {
				defaultNamespace: "default-connector"
			}
		});

		const id = await service.create(
			{
				mode: "dynamic",
				data: new Uint8Array([1, 2, 3]),
				description: "create using default namespace"
			},
			undefined,
			"did:test:controller-default"
		);

		expect(id).toBe("notarization:urn:notarization:default-connector:1");
	});

	test("Can create using the provided namespace", async () => {
		NotarizationConnectorFactory.register(
			"default-connector",
			() => new TestNotarizationConnector("notarization:urn:notarization:default-connector:1")
		);
		NotarizationConnectorFactory.register(
			"override-connector",
			() => new TestNotarizationConnector("notarization:urn:notarization:override-connector:1")
		);

		const service = new NotarizationService({
			config: {
				defaultNamespace: "default-connector"
			}
		});

		const id = await service.create(
			{
				mode: "dynamic",
				data: new Uint8Array([4, 5, 6]),
				description: "create using explicit namespace"
			},
			"override-connector",
			"did:test:controller-override"
		);

		expect(id).toBe("notarization:urn:notarization:override-connector:1");
	});

	test("Throws when no connectors are registered", async () => {
		expect(() => new NotarizationService()).toThrow();
	});

	test("Can get using connector from notarization id namespace", async () => {
		const connector = new TestNotarizationConnector("urn:notarization:default-connector:1");
		NotarizationConnectorFactory.register("default-connector", () => connector);

		const service = new NotarizationService({
			config: {
				defaultNamespace: "default-connector"
			}
		});

		const result = await service.get("urn:notarization:default-connector:abc123");

		expect(result.id).toBe("urn:notarization:default-connector:abc123");
		expect(result.description).toBe("from-test-connector");
	});

	test("Can remove and pass identity through to connector", async () => {
		const connector = new TestNotarizationConnector("urn:notarization:default-connector:1");
		NotarizationConnectorFactory.register("default-connector", () => connector);

		const service = new NotarizationService({
			config: {
				defaultNamespace: "default-connector"
			}
		});

		const id = "urn:notarization:default-connector:abc123";
		const identity = "did:test:controller-remove";

		await service.remove(id, identity);

		expect(connector.removeCalls).toEqual([{ controllerIdentity: identity, id }]);
	});

	test("Can update and pass identity through to connector", async () => {
		const connector = new TestNotarizationConnector("urn:notarization:default-connector:1");
		NotarizationConnectorFactory.register("default-connector", () => connector);

		const service = new NotarizationService({
			config: {
				defaultNamespace: "default-connector"
			}
		});

		const notarization: INotarization = {
			id: "urn:notarization:default-connector:abc123",
			mode: "dynamic",
			dateCreated: "2026-01-01T00:00:00.000Z",
			data: new Uint8Array([9, 8, 7]),
			description: "update-through-service"
		};
		const identity = "did:test:controller-update";

		await service.update(notarization, identity);

		expect(connector.updateCalls).toEqual([{ controllerIdentity: identity, notarization }]);
	});

	test("Can transfer and pass identity through to connector", async () => {
		const connector = new TestNotarizationConnector("urn:notarization:default-connector:1");
		NotarizationConnectorFactory.register("default-connector", () => connector);

		const service = new NotarizationService({
			config: {
				defaultNamespace: "default-connector"
			}
		});

		const id = "urn:notarization:default-connector:abc123";
		const identity = "did:test:controller-transfer";
		const recipientAddress = "recipient-address-123";

		await service.transfer(id, recipientAddress, identity);

		expect(connector.transferCalls).toEqual([
			{ controllerIdentity: identity, id, recipientAddress }
		]);
	});

	test("Wraps get errors for namespace mismatch", async () => {
		const connector = new TestNotarizationConnector("urn:notarization:default-connector:1");
		NotarizationConnectorFactory.register("default-connector", () => connector);

		const service = new NotarizationService({
			config: {
				defaultNamespace: "default-connector"
			}
		});

		await expect(service.get("urn:other:default-connector:abc123")).rejects.toThrow("getFailed");
	});

	test("Wraps transfer errors from connector", async () => {
		const connector = new TestNotarizationConnector("urn:notarization:default-connector:1");
		connector.transferError = new Error("connector-transfer-failure");
		NotarizationConnectorFactory.register("default-connector", () => connector);

		const service = new NotarizationService({
			config: {
				defaultNamespace: "default-connector"
			}
		});

		await expect(
			service.transfer(
				"urn:notarization:default-connector:abc123",
				"recipient-address-123",
				"did:test:controller-transfer"
			)
		).rejects.toThrow("transferFailed");
	});
});
