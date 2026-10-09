// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ComponentFactory, Factory, Is } from "@3sixty/core";
import {
	NotarizationConnectorFactory,
	NotarizationMetricIds,
	type INotarization,
	type INotarizationConnector
} from "@3sixty/notarization-models";
import {
	MetricType,
	type ITelemetryComponent,
	type ITelemetryMetric
} from "@3sixty/telemetry-models";
import { NotarizationService } from "../src/notarizationService.js";

const TEST_CONTROLLER = "did:test:controller";
const TEST_NAMESPACE = "test-connector";
const TEST_ID = `urn:notarization:${TEST_NAMESPACE}:abc123`;
const TEST_RECIPIENT = "recipient-address-123";

interface MetricValueEntry {
	id: string;
	value: "inc" | "dec" | number;
	customData?: { [key: string]: unknown };
}

function makeMockTelemetry(): {
	component: ITelemetryComponent;
	created: ITelemetryMetric[];
	values: MetricValueEntry[];
} {
	const created: ITelemetryMetric[] = [];
	const values: MetricValueEntry[] = [];
	const component: ITelemetryComponent = {
		className: () => "MockTelemetry",
		start: async () => {},
		stop: async () => {},
		createMetric: async m => {
			for (const metric of Is.array(m) ? m : [m]) {
				created.push({ ...metric });
			}
		},
		getMetric: async () => ({ metric: {} as never, value: {} as never }),
		updateMetric: async () => {},
		addMetricValue: async (id, value, customData) => {
			values.push({ id, value, customData });
			return "v";
		},
		addMetricValues: async entries => {
			values.push(...entries);
			return entries.map(() => "v");
		},
		getMetricValue: async (id, valueId) => ({
			id: valueId,
			metricId: id,
			value: 0,
			ts: Date.now()
		}),
		removeMetric: async () => {},
		query: async () => ({ entities: [] }),
		queryValues: async () => ({ metric: {} as never, entities: [] })
	};
	return { component, created, values };
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

describe("NotarizationService - metrics", () => {
	beforeEach(() => {
		NotarizationConnectorFactory.register(TEST_NAMESPACE, () => new StubNotarizationConnector());
	});

	afterEach(() => {
		Factory.clearFactories();
	});

	describe("instrumented path", () => {
		test("start() registers all notarization metrics with the telemetry component", async () => {
			const { component, created } = makeMockTelemetry();
			ComponentFactory.register("test-telemetry", () => component);

			const service = new NotarizationService({
				config: { defaultNamespace: TEST_NAMESPACE },
				telemetryComponentType: "test-telemetry"
			});
			await service.start();

			const ids = created.map(m => m.id);
			expect(ids).toContain(NotarizationMetricIds.NotarizationsCreated);
			expect(ids).toContain(NotarizationMetricIds.NotarizationsUpdated);
			expect(ids).toContain(NotarizationMetricIds.NotarizationsTransferred);
			expect(ids).toContain(NotarizationMetricIds.NotarizationsRemoved);
			expect(created.every(m => m.type === MetricType.Counter)).toBe(true);
		});

		test("create() increments notarization_notarizations_created with mode", async () => {
			const { component, values } = makeMockTelemetry();
			ComponentFactory.register("test-telemetry", () => component);

			const service = new NotarizationService({
				config: { defaultNamespace: TEST_NAMESPACE },
				telemetryComponentType: "test-telemetry"
			});
			await service.start();

			await service.create(
				{ mode: "dynamic", data: new Uint8Array([1, 2, 3]) },
				undefined,
				TEST_CONTROLLER
			);

			const created = values.filter(v => v.id === NotarizationMetricIds.NotarizationsCreated);
			expect(created).toHaveLength(1);
			expect(created[0].value).toBe("inc");
			expect(created[0].customData?.mode).toBe("dynamic");
		});

		test("remove() increments notarization_notarizations_removed", async () => {
			const { component, values } = makeMockTelemetry();
			ComponentFactory.register("test-telemetry", () => component);

			const service = new NotarizationService({
				config: { defaultNamespace: TEST_NAMESPACE },
				telemetryComponentType: "test-telemetry"
			});
			await service.start();

			await service.remove(TEST_ID, TEST_CONTROLLER);

			const removed = values.filter(v => v.id === NotarizationMetricIds.NotarizationsRemoved);
			expect(removed).toHaveLength(1);
			expect(removed[0].value).toBe("inc");
		});

		test("update() increments notarization_notarizations_updated with mode", async () => {
			const { component, values } = makeMockTelemetry();
			ComponentFactory.register("test-telemetry", () => component);

			const service = new NotarizationService({
				config: { defaultNamespace: TEST_NAMESPACE },
				telemetryComponentType: "test-telemetry"
			});
			await service.start();

			const notarization: INotarization = {
				id: TEST_ID,
				mode: "locked",
				dateCreated: "2026-01-01T00:00:00.000Z",
				data: new Uint8Array([9, 8, 7])
			};
			await service.update(notarization, TEST_CONTROLLER);

			const updated = values.filter(v => v.id === NotarizationMetricIds.NotarizationsUpdated);
			expect(updated).toHaveLength(1);
			expect(updated[0].value).toBe("inc");
			expect(updated[0].customData?.mode).toBe("locked");
		});

		test("transfer() increments notarization_notarizations_transferred", async () => {
			const { component, values } = makeMockTelemetry();
			ComponentFactory.register("test-telemetry", () => component);

			const service = new NotarizationService({
				config: { defaultNamespace: TEST_NAMESPACE },
				telemetryComponentType: "test-telemetry"
			});
			await service.start();

			await service.transfer(TEST_ID, TEST_RECIPIENT, TEST_CONTROLLER);

			const transferred = values.filter(
				v => v.id === NotarizationMetricIds.NotarizationsTransferred
			);
			expect(transferred).toHaveLength(1);
			expect(transferred[0].value).toBe("inc");
		});
	});

	describe("uninstrumented path", () => {
		test("create() succeeds without a telemetry component", async () => {
			const service = new NotarizationService({ config: { defaultNamespace: TEST_NAMESPACE } });

			const id = await service.create(
				{ mode: "dynamic", data: new Uint8Array([1, 2, 3]) },
				undefined,
				TEST_CONTROLLER
			);

			expect(id).toBeDefined();
		});

		test("remove() succeeds without a telemetry component", async () => {
			const service = new NotarizationService({ config: { defaultNamespace: TEST_NAMESPACE } });

			await expect(service.remove(TEST_ID, TEST_CONTROLLER)).resolves.toBeUndefined();
		});
	});
});
