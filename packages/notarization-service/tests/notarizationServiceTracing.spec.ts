// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ComponentFactory, Factory, GeneralError } from "@twin.org/core";
import {
	NotarizationConnectorFactory,
	NotarizationSpanAttributes,
	NotarizationSpanNames,
	type INotarization,
	type INotarizationConnector
} from "@twin.org/notarization-models";
import {
	SpanHelper,
	SpanStatus,
	type ISpan,
	type ISpanOptions,
	type ITracingComponent
} from "@twin.org/tracing-models";
import { NotarizationService } from "../src/notarizationService.js";

const TEST_CONTROLLER = "did:test:controller";
const TEST_NAMESPACE = "test-connector";
const TEST_ID = `urn:notarization:${TEST_NAMESPACE}:abc123`;
const TEST_RECIPIENT = "recipient-address-123";

function makeMockTracing(): { component: ITracingComponent; ended: ISpan[] } {
	const ended: ISpan[] = [];
	const component: ITracingComponent = {
		className: () => "MockTracing",
		startSpan: async (name: string, options?: ISpanOptions) => SpanHelper.startSpan(name, options),
		endSpan: async (span: ISpan, status?: SpanStatus) => {
			SpanHelper.endSpan(span, status);
			ended.push(span);
		},
		query: async () => ({ entities: [] }),
		getTrace: async () => []
	};
	return { component, ended };
}

class StubNotarizationConnector implements INotarizationConnector {
	public className(): string {
		return "StubNotarizationConnector";
	}

	public async create(
		controllerIdentity: string,
		notarization: Omit<INotarization, "id" | "dateCreated">
	): Promise<string> {
		return TEST_ID;
	}

	public async get(id: string): Promise<INotarization> {
		return {
			id,
			mode: "dynamic",
			dateCreated: "2026-01-01T00:00:00.000Z",
			data: new Uint8Array([1, 2, 3])
		};
	}

	public async remove(controllerIdentity: string, id: string): Promise<void> {}

	public async update(controllerIdentity: string, notarization: INotarization): Promise<void> {}

	public async transfer(
		controllerIdentity: string,
		id: string,
		recipientAddress: string
	): Promise<void> {}
}

class FailingNotarizationConnector extends StubNotarizationConnector {
	public async get(id: string): Promise<INotarization> {
		throw new GeneralError("test", "connectorFailed");
	}
}

function makeService(tracingComponentType?: string): NotarizationService {
	return new NotarizationService({
		config: { defaultNamespace: TEST_NAMESPACE },
		tracingComponentType
	});
}

describe("NotarizationService - tracing", () => {
	beforeEach(() => {
		NotarizationConnectorFactory.register(TEST_NAMESPACE, () => new StubNotarizationConnector());
	});

	afterEach(() => {
		Factory.clearFactories();
	});

	describe("instrumented path", () => {
		test("create() records a span carrying the mode", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);

			await makeService("test-tracing").create(
				{ mode: "dynamic", data: new Uint8Array([1, 2, 3]) },
				undefined,
				TEST_CONTROLLER
			);

			expect(ended).toHaveLength(1);
			expect(ended[0].name).toEqual(NotarizationSpanNames.Create);
			expect(ended[0].status).toEqual(SpanStatus.Ok);
			expect(ended[0].attributes?.[NotarizationSpanAttributes.Mode]).toEqual("dynamic");
		});

		test("get() records a span carrying the id", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);

			await makeService("test-tracing").get(TEST_ID);

			expect(ended).toHaveLength(1);
			expect(ended[0].name).toEqual(NotarizationSpanNames.Get);
			expect(ended[0].attributes?.[NotarizationSpanAttributes.Id]).toEqual(TEST_ID);
		});

		test("remove() records a span", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);

			await makeService("test-tracing").remove(TEST_ID, TEST_CONTROLLER);

			expect(ended).toHaveLength(1);
			expect(ended[0].name).toEqual(NotarizationSpanNames.Remove);
			expect(ended[0].status).toEqual(SpanStatus.Ok);
		});

		test("update() records a span", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);

			await makeService("test-tracing").update(
				{
					id: TEST_ID,
					mode: "dynamic",
					dateCreated: "2026-01-01T00:00:00.000Z",
					data: new Uint8Array([1, 2, 3])
				},
				TEST_CONTROLLER
			);

			expect(ended).toHaveLength(1);
			expect(ended[0].name).toEqual(NotarizationSpanNames.Update);
			expect(ended[0].attributes?.[NotarizationSpanAttributes.Id]).toEqual(TEST_ID);
		});

		test("transfer() records a span", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);

			await makeService("test-tracing").transfer(TEST_ID, TEST_RECIPIENT, TEST_CONTROLLER);

			expect(ended).toHaveLength(1);
			expect(ended[0].name).toEqual(NotarizationSpanNames.Transfer);
			expect(ended[0].status).toEqual(SpanStatus.Ok);
		});

		test("a failure ends the span with an error and records the domain error", async () => {
			const { component, ended } = makeMockTracing();
			ComponentFactory.register("test-tracing", () => component);
			NotarizationConnectorFactory.register(
				TEST_NAMESPACE,
				() => new FailingNotarizationConnector()
			);

			await expect(makeService("test-tracing").get(TEST_ID)).rejects.toThrow(GeneralError);

			expect(ended).toHaveLength(1);
			expect(ended[0].status).toEqual(SpanStatus.Error);
			// The span sees the domain error, not the raw connector one.
			expect(ended[0].attributes?.["exception.message"]).toEqual("notarizationService.getFailed");
		});
	});

	describe("uninstrumented path", () => {
		test("operations behave unchanged with no tracing component configured", async () => {
			const service = makeService();

			await expect(service.get(TEST_ID)).resolves.toMatchObject({ id: TEST_ID });
			await expect(
				service.create(
					{ mode: "dynamic", data: new Uint8Array([1, 2, 3]) },
					undefined,
					TEST_CONTROLLER
				)
			).resolves.toEqual(TEST_ID);
		});

		test("an unresolvable tracing component type is ignored", async () => {
			const service = makeService("not-registered");

			await expect(service.get(TEST_ID)).resolves.toMatchObject({ id: TEST_ID });
		});
	});
});
