# Notarization Models Examples

Use these snippets to define notarization payloads and wire connector implementations for runtime resolution.

## NotarizationConnectorFactory

```typescript
import {
  NotarizationConnectorFactory,
  NotarizationMode,
  type INotarization,
  type INotarizationConnector
} from '@3sixty/notarization-models';

class InMemoryConnector implements INotarizationConnector {
  private readonly store: Map<string, INotarization>;

  constructor() {
    this.store = new Map<string, INotarization>();
  }

  public className(): string {
    return 'InMemoryConnector';
  }

  public async create(
    controllerIdentity: string,
    notarization: Omit<INotarization, 'id' | 'dateCreated'>
  ): Promise<string> {
    const id = 'notarization:urn:notarization:memory:1';
    this.store.set(id, {
      ...notarization,
      id,
      mode: notarization.mode ?? NotarizationMode.Dynamic,
      dateCreated: new Date().toISOString()
    });
    return id;
  }

  public async get(id: string): Promise<INotarization> {
    const item = this.store.get(id);
    if (!item) {
      throw new Error('Missing notarization');
    }
    return item;
  }

  public async remove(controllerIdentity: string, id: string): Promise<void> {
    this.store.delete(id);
  }

  public async update(controllerIdentity: string, notarization: INotarization): Promise<void> {
    this.store.set(notarization.id, notarization);
  }

  public async transfer(
    controllerIdentity: string,
    id: string,
    recipientAddress: string
  ): Promise<void> {
    const item = this.store.get(id);
    if (!item) {
      throw new Error('Missing notarization');
    }
    this.store.set(id, item);
  }
}

NotarizationConnectorFactory.register('memory', () => new InMemoryConnector());

const connector = NotarizationConnectorFactory.get<INotarizationConnector>('memory');
const notarizationId = await connector.create('did:example:controller', {
  mode: NotarizationMode.Dynamic,
  data: new Uint8Array([1, 2, 3]),
  description: 'Initial notarization'
});

console.log(notarizationId); // notarization:urn:notarization:memory:1
```

## INotarization And API Models

```typescript
import {
  NotarizationMode,
  type INotarization,
  type INotarizationCreateRequest,
  type INotarizationGetRequest,
  type INotarizationGetResponse
} from '@3sixty/notarization-models';

const newNotarizationRequest: INotarizationCreateRequest = {
  body: {
    mode: NotarizationMode.Dynamic,
    data: new Uint8Array([10, 11, 12]),
    description: 'Created from API request',
    namespace: 'entity-storage'
  }
};

const getRequest: INotarizationGetRequest = {
  pathParams: {
    id: 'notarization:urn:notarization:entity-storage:abc123'
  }
};

const responseBody: INotarization = {
  id: getRequest.pathParams.id,
  mode: NotarizationMode.Dynamic,
  dateCreated: '2026-01-01T00:00:00.000Z',
  data: new Uint8Array([10, 11, 12]),
  description: 'Created from API request'
};

const getResponse: INotarizationGetResponse = {
  body: responseBody
};

console.log(newNotarizationRequest.body.namespace); // entity-storage
console.log(getResponse.body.id); // notarization:urn:notarization:entity-storage:abc123
```
