# Notarization REST Client Examples

Use these snippets to call HTTP endpoints for creation, retrieval, updates, transfers, and removal from application code.

## NotarizationRestClient

```typescript
import { NotarizationMode } from '@twin.org/notarization-models';
import { NotarizationRestClient } from '@twin.org/notarization-rest-client';

const client = new NotarizationRestClient({
  endpoint: 'http://localhost:8080'
});

const id = await client.create(
  {
    mode: NotarizationMode.Dynamic,
    data: new Uint8Array([1, 2, 3]),
    description: 'Created through REST client'
  },
  'entity-storage'
);

console.log(id); // notarization:urn:notarization:entity-storage:<generated>

const notarization = await client.get(id);
console.log(notarization.mode); // dynamic
```

```typescript
import { NotarizationMode } from '@twin.org/notarization-models';
import { NotarizationRestClient } from '@twin.org/notarization-rest-client';

const client = new NotarizationRestClient({
  endpoint: 'http://localhost:8080'
});

await client.update({
  id: 'notarization:urn:notarization:entity-storage:abc123',
  mode: NotarizationMode.Dynamic,
  dateCreated: '2026-01-01T00:00:00.000Z',
  data: new Uint8Array([9, 9, 9]),
  description: 'Updated through REST client'
});

await client.transfer(
  'notarization:urn:notarization:entity-storage:abc123',
  'did:example:recipient'
);

await client.remove('notarization:urn:notarization:entity-storage:abc123');
```
