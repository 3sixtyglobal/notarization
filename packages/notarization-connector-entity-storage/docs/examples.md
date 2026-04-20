# Notarization Connector Entity Storage Examples

Use these snippets to set up local persistence, create records, and run lifecycle operations during development and integration tests.

## EntityStorageNotarizationConnector

```typescript
import { MemoryEntityStorageConnector } from '@twin.org/entity-storage-connector-memory';
import { EntityStorageConnectorFactory } from '@twin.org/entity-storage-models';
import { NotarizationMode } from '@twin.org/notarization-models';
import { nameof } from '@twin.org/nameof';
import {
  EntityStorageNotarizationConnector,
  Notarization,
  initSchema
} from '@twin.org/notarization-connector-entity-storage';

initSchema();

const memoryStore = new MemoryEntityStorageConnector<Notarization>({
  entitySchema: nameof<Notarization>()
});

EntityStorageConnectorFactory.register('notarization', () => memoryStore);

const connector = new EntityStorageNotarizationConnector();

const id = await connector.create('did:example:controller', {
  mode: NotarizationMode.Dynamic,
  data: new Uint8Array([1, 2, 3, 4]),
  description: 'Stored locally',
  immutableDescription: 'Set at creation'
});

const created = await connector.get(id);
console.log(created.id); // notarization:urn:notarization:entity-storage:<generated>

await connector.update('did:example:controller', {
  ...created,
  description: 'Updated locally',
  data: new Uint8Array([9, 8, 7, 6])
});

await connector.transfer(
  'did:example:controller',
  id,
  '0x1234567890abcdef1234567890abcdef12345678'
);
await connector.remove('did:example:controller', id);
```

## Notarization

```typescript
import { NotarizationMode } from '@twin.org/notarization-models';
import type { Notarization } from '@twin.org/notarization-connector-entity-storage';

const record: Notarization = {
  id: 'abc123',
  mode: NotarizationMode.Dynamic,
  dateCreated: new Date().toISOString(),
  data: 'AQID',
  description: 'Entity representation',
  immutableDescription: 'Original note',
  controllerIdentity: 'did:example:controller',
  owner: 'did:example:controller'
};

console.log(record.mode); // dynamic
```

## initSchema

```typescript
import { EntitySchemaFactory } from '@twin.org/entity';
import { nameof } from '@twin.org/nameof';
import { Notarization, initSchema } from '@twin.org/notarization-connector-entity-storage';

initSchema();
const schema = EntitySchemaFactory.get(nameof<Notarization>());

console.log(schema.entityName); // Notarization
```
