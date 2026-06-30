# TWIN Notarization Connector IOTA

This package provides an IOTA-backed notarization connector for network operations and on-ledger state. It is designed for applications that need ledger-level ownership and metadata operations.

## Installation

```shell
npm install @twin.org/notarization-connector-iota
```

## Docker

To perform testing of this component it may be necessary to launch a local instance of the gas station to communicate with.

```shell
docker run -d --name twin-gas-station-test -p 6379:6379 -p 9527:9527 -p 9184:9184 -e IOTA_NODE_URL="https://api.testnet.iota.cafe" -e GAS_STATION_AUTH="qEyCL6d9BKKFl/tfDGAKeGFkhUlf7FkqiGV7Xw4JUsI=" twinfoundation/twin-gas-station-test:latest
```

## Examples

Usage of the APIs is shown in the examples [docs/examples.md](docs/examples.md)

## References

The API reference is available in [docs/reference/index.md](docs/reference/index.md)

## Changelog

The changes between each version can be found in [docs/changelog.md](docs/changelog.md)
