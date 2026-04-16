# Notarization Connector IOTA Examples

Use these snippets to configure a network-backed connector and execute create, read, update, transfer, and remove operations.

## IotaNotarizationConnector

```typescript
import { NotarizationMode } from '@twin.org/notarization-models';
import { IotaNotarizationConnector } from '@twin.org/notarization-connector-iota';

const connector = new IotaNotarizationConnector({
  config: {
    network: 'testnet',
    vaultMnemonicId: 'test-mnemonic',
    clientOptions: {
      url: 'https://api.testnet.iota.cafe'
    },
    walletAddressIndex: 0,
    enableCostLogging: true
  },
  vaultConnectorType: 'vault',
  walletConnectorType: 'wallet'
});

const id = await connector.create('did:example:owner', {
  mode: NotarizationMode.Dynamic,
  data: new Uint8Array([1, 2, 3]),
  description: 'On-ledger notarization',
  immutableDescription: 'Immutable context'
});

const current = await connector.get(id);
console.log(current.mode); // dynamic

await connector.update('did:example:owner', {
  ...current,
  description: 'Updated on ledger',
  data: new Uint8Array([4, 5, 6])
});

await connector.transfer('did:example:owner', id, 'did:example:recipient');
await connector.remove('did:example:recipient', id);
```

```typescript
import { NotarizationMode } from '@twin.org/notarization-models';
import { IotaNotarizationConnector } from '@twin.org/notarization-connector-iota';

const connector = new IotaNotarizationConnector({
  config: {
    network: 'testnet',
    vaultMnemonicId: 'test-mnemonic',
    clientOptions: {
      url: 'https://api.testnet.iota.cafe'
    }
  }
});

const lockedId = await connector.create('did:example:owner', {
  mode: NotarizationMode.Locked,
  data: new Uint8Array([7, 7, 7]),
  description: 'Locked notarization',
  deleteLockDateTime: '2026-12-31T23:59:59.000Z'
});

const locked = await connector.get(lockedId);
console.log(locked.deleteLockDateTime); // 2026-12-31T23:59:59.000Z
```
