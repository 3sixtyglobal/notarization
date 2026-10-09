# 3Sixty Notarization

This repository provides modular components for notarization workflows across model, connector, service, and client layers. Together they allow applications to define notarization contracts once and apply them consistently across local storage and IOTA-backed execution paths.

The components are designed to be composed, so orchestration and transport can remain stable while backend implementations vary by deployment and operational needs.

## Packages

- [notarization-models](packages/notarization-models/README.md) - Shared notarization interfaces, request and response models, and connector contracts.
- [notarization-connector-iota](packages/notarization-connector-iota/README.md) - IOTA-backed notarization connector for network operations and on-ledger state.
- [notarization-connector-entity-storage](packages/notarization-connector-entity-storage/README.md) - Entity storage notarization connector for local persistence and test-oriented workflows.
- [notarization-service](packages/notarization-service/README.md) - Notarization service orchestration with REST route generation.
- [notarization-rest-client](packages/notarization-rest-client/README.md) - HTTP client for calling notarization service endpoints from applications.

## Contributing

To contribute to this repository see the guidelines for building and publishing in [CONTRIBUTING](./CONTRIBUTING.md)

## Origin

This repository is derived from the original [iotaledger/twin-notarization](https://github.com/iotaledger/twin-notarization) repository.
