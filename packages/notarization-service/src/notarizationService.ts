// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	HealthCategory,
	HealthStatus,
	type HealthApplicationCallback,
	type IHealth,
	type IHealthProviderComponent
} from "@twin.org/api-models";
import { ContextIdKeys, ContextIdStore } from "@twin.org/context";
import {
	BaseError,
	ComponentFactory,
	GeneralError,
	Guards,
	Is,
	RandomHelper,
	Urn
} from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import {
	NotarizationConnectorFactory,
	NotarizationMetricIds,
	NotarizationMetrics,
	NotarizationMode,
	NotarizationSpanAttributes,
	NotarizationSpanNames,
	type INotarization,
	type INotarizationComponent,
	type INotarizationConnector
} from "@twin.org/notarization-models";
import { MetricHelper, type ITelemetryComponent } from "@twin.org/telemetry-models";
import { TracingHelper, type ITracingComponent } from "@twin.org/tracing-models";
import type { INotarizationServiceConstructorOptions } from "./models/INotarizationServiceConstructorOptions.js";

/**
 * Service for notarization operations.
 */
export class NotarizationService implements INotarizationComponent, IHealthProviderComponent {
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
	 * The optional telemetry component for recording metrics.
	 * @internal
	 */
	private readonly _telemetryComponent?: ITelemetryComponent;

	/**
	 * The optional tracing component for recording spans.
	 * @internal
	 */
	private readonly _tracingComponent?: ITracingComponent;

	/**
	 * Create a new instance of NotarizationService.
	 * @param options The constructor options.
	 * @throws GeneralError If no notarization connectors are registered.
	 */
	constructor(options?: INotarizationServiceConstructorOptions) {
		const names = NotarizationConnectorFactory.names();
		if (names.length === 0) {
			throw new GeneralError(NotarizationService.CLASS_NAME, "noConnectors");
		}

		this._defaultNamespace = options?.config?.defaultNamespace ?? names[0];
		this._telemetryComponent = ComponentFactory.getIfExists<ITelemetryComponent>(
			options?.telemetryComponentType
		);
		this._tracingComponent = ComponentFactory.getIfExists<ITracingComponent>(
			options?.tracingComponentType
		);
	}

	/**
	 * Returns the class name of the component.
	 * @returns The class name of the component.
	 */
	public className(): string {
		return NotarizationService.CLASS_NAME;
	}

	/**
	 * Registers the notarization metrics with the telemetry component.
	 */
	public async start(): Promise<void> {
		if (Is.undefined(this._telemetryComponent)) {
			return;
		}
		await MetricHelper.createMetrics(this._telemetryComponent, NotarizationMetrics);
	}

	/**
	 * Runs a full notarization lifecycle (create, get, remove) against the organisation identity
	 * from the current context and returns the result directly.
	 * @param callback The callback to invoke when a deferred health result is ready.
	 * @returns The health status of the service.
	 */
	public async healthApplication(
		callback: HealthApplicationCallback
	): Promise<IHealth[] | undefined> {
		const contextIds = (await ContextIdStore.getContextIds()) ?? {};
		const orgId = contextIds[ContextIdKeys.Organization];

		if (!Is.stringValue(orgId)) {
			return [];
		}

		try {
			const connector = NotarizationConnectorFactory.get<INotarizationConnector>(
				this._defaultNamespace
			);
			const notarizationId = await connector.create(orgId, {
				mode: NotarizationMode.Dynamic,
				data: RandomHelper.generate(32)
			});
			const info = await connector.get(notarizationId);
			await connector.remove(orgId, notarizationId);
			return [
				{
					source: NotarizationService.CLASS_NAME,
					category: HealthCategory.Application,
					status: Is.object(info) ? HealthStatus.Ok : HealthStatus.Error,
					description: "healthDescription",
					message: Is.object(info) ? undefined : "getNotarizationFailed",
					data: {
						notarizationId
					}
				}
			];
		} catch (error) {
			return [
				{
					source: NotarizationService.CLASS_NAME,
					category: HealthCategory.Application,
					status: HealthStatus.Error,
					description: "healthDescription",
					message: "getNotarizationFailed",
					error: BaseError.fromError(error)
				}
			];
		}
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

		return TracingHelper.withSpan(
			this._tracingComponent,
			NotarizationSpanNames.Create,
			{ attributes: { [NotarizationSpanAttributes.Mode]: notarization.mode } },
			async () => {
				try {
					const connectorNamespace = namespace ?? this._defaultNamespace;

					const notarizationConnector =
						NotarizationConnectorFactory.get<INotarizationConnector>(connectorNamespace);

					const notarizationId = await notarizationConnector.create(
						controllerIdentity,
						notarization
					);

					await MetricHelper.metricIncrement(
						this._telemetryComponent,
						NotarizationMetricIds.NotarizationsCreated,
						{ mode: notarization.mode }
					);

					return notarizationId;
				} catch (error) {
					throw new GeneralError(NotarizationService.CLASS_NAME, "createFailed", undefined, error);
				}
			}
		);
	}

	/**
	 * Get an existing notarization.
	 * @param id The id of the notarization to get.
	 * @returns The notarization.
	 */
	public async get(id: string): Promise<INotarization> {
		Urn.guard(NotarizationService.CLASS_NAME, nameof(id), id);

		return TracingHelper.withSpan(
			this._tracingComponent,
			NotarizationSpanNames.Get,
			{ attributes: { [NotarizationSpanAttributes.Id]: id } },
			async () => {
				try {
					const notarizationConnector = this.getConnector(id);
					const result = await notarizationConnector.get(id);

					return result;
				} catch (error) {
					throw new GeneralError(NotarizationService.CLASS_NAME, "getFailed", undefined, error);
				}
			}
		);
	}

	/**
	 * Remove an existing notarization.
	 * @param id The id of the notarization to remove.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns A promise that resolves when the notarization has been removed.
	 */
	public async remove(id: string, controllerIdentity?: string): Promise<void> {
		Urn.guard(NotarizationService.CLASS_NAME, nameof(id), id);
		Guards.stringValue(
			NotarizationService.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);

		await TracingHelper.withSpan(
			this._tracingComponent,
			NotarizationSpanNames.Remove,
			{ attributes: { [NotarizationSpanAttributes.Id]: id } },
			async () => {
				try {
					const notarizationConnector = this.getConnector(id);
					await notarizationConnector.remove(controllerIdentity, id);

					await MetricHelper.metricIncrement(
						this._telemetryComponent,
						NotarizationMetricIds.NotarizationsRemoved
					);
				} catch (error) {
					throw new GeneralError(NotarizationService.CLASS_NAME, "removeFailed", undefined, error);
				}
			}
		);
	}

	/**
	 * Update an existing notarization.
	 * @param notarization The notarization to update.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns A promise that resolves when the notarization has been updated.
	 */
	public async update(notarization: INotarization, controllerIdentity?: string): Promise<void> {
		Guards.object(NotarizationService.CLASS_NAME, nameof(notarization), notarization);
		Urn.guard(NotarizationService.CLASS_NAME, nameof(notarization.id), notarization.id);
		Guards.stringValue(
			NotarizationService.CLASS_NAME,
			nameof(controllerIdentity),
			controllerIdentity
		);

		await TracingHelper.withSpan(
			this._tracingComponent,
			NotarizationSpanNames.Update,
			{ attributes: { [NotarizationSpanAttributes.Id]: notarization.id } },
			async () => {
				try {
					const notarizationConnector = this.getConnector(notarization.id);
					await notarizationConnector.update(controllerIdentity, notarization);

					await MetricHelper.metricIncrement(
						this._telemetryComponent,
						NotarizationMetricIds.NotarizationsUpdated,
						{ mode: notarization.mode }
					);
				} catch (error) {
					throw new GeneralError(NotarizationService.CLASS_NAME, "updateFailed", undefined, error);
				}
			}
		);
	}

	/**
	 * Transfer an existing notarization.
	 * @param id The id of the notarization to transfer.
	 * @param recipientAddress The recipient address.
	 * @param controllerIdentity The identity to perform the notarization operation with.
	 * @returns A promise that resolves when the notarization has been transferred.
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

		await TracingHelper.withSpan(
			this._tracingComponent,
			NotarizationSpanNames.Transfer,
			{ attributes: { [NotarizationSpanAttributes.Id]: id } },
			async () => {
				try {
					const notarizationConnector = this.getConnector(id);
					await notarizationConnector.transfer(controllerIdentity, id, recipientAddress);

					await MetricHelper.metricIncrement(
						this._telemetryComponent,
						NotarizationMetricIds.NotarizationsTransferred
					);
				} catch (error) {
					throw new GeneralError(
						NotarizationService.CLASS_NAME,
						"transferFailed",
						undefined,
						error
					);
				}
			}
		);
	}

	/**
	 * Get the connector from the id.
	 * @param id The id of the notarization in urn format.
	 * @returns The connector.
	 * @throws GeneralError If the namespace does not match.
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
