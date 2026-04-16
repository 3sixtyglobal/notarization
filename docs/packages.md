# Notarization Packages

## notarization-models

This package defines the shared contracts used by connectors, service orchestration, and HTTP clients. It establishes the canonical shape of notarization payloads and operations so implementations can be swapped without rewriting integration code.

- [README](../packages/notarization-models/README.md)
- [Examples](../packages/notarization-models/docs/examples.md)
- [Changelog](../packages/notarization-models/docs/changelog.md)

## notarization-connector-iota

This package provides the network-backed connector implementation for IOTA. It handles lifecycle operations against on-ledger state while preserving the shared operation contract defined in the model layer.

- [README](../packages/notarization-connector-iota/README.md)
- [Examples](../packages/notarization-connector-iota/docs/examples.md)
- [Changelog](../packages/notarization-connector-iota/docs/changelog.md)

## notarization-connector-entity-storage

This package provides a local persistence connector for development and integration testing scenarios. It enables deterministic behaviour without requiring a live network dependency while matching the same connector contract.

- [README](../packages/notarization-connector-entity-storage/README.md)
- [Examples](../packages/notarization-connector-entity-storage/docs/examples.md)
- [Changelog](../packages/notarization-connector-entity-storage/docs/changelog.md)

## notarization-service

This package provides orchestration logic that resolves connectors by namespace and exposes route helpers for API integration. It acts as the application-facing coordination layer for notarization operations.

- [README](../packages/notarization-service/README.md)
- [Examples](../packages/notarization-service/docs/examples.md)
- [Changelog](../packages/notarization-service/docs/changelog.md)

## notarization-rest-client

This package provides an HTTP client abstraction for consuming service endpoints from external applications. It offers a stable client-side interface aligned with the shared model contracts.

- [README](../packages/notarization-rest-client/README.md)
- [Examples](../packages/notarization-rest-client/docs/examples.md)
- [Changelog](../packages/notarization-rest-client/docs/changelog.md)
