# Notarization Service Examples

Use these snippets to compose connector-backed orchestration and expose HTTP route handlers for request processing.

## NotarizationService

```typescript
import {
  NotarizationConnectorFactory,
  NotarizationMode,
  type INotarization,
  type INotarizationConnector
} from '@twin.org/notarization-models';
import { NotarizationService } from '@twin.org/notarization-service';

class DemoConnector implements INotarizationConnector {
  private readonly store: Map<string, INotarization>;

  constructor() {
    this.store = new Map<string, INotarization>();
  }

  public className(): string {
    return 'DemoConnector';
  }

  public async create(
    controllerIdentity: string,
    notarization: Omit<INotarization, 'id' | 'dateCreated'>
  ): Promise<string> {
    const id = 'notarization:urn:notarization:demo:1';
    this.store.set(id, {
      ...notarization,
      id,
      mode: notarization.mode ?? NotarizationMode.Dynamic,
      dateCreated: new Date().toISOString()
    });
    return id;
  }

  public async get(id: string): Promise<INotarization> {
    const value = this.store.get(id);
    if (!value) {
      throw new Error('Missing notarization');
    }
    return value;
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
    const value = this.store.get(id);
    if (!value) {
      throw new Error('Missing notarization');
    }
    this.store.set(id, value);
  }
}

NotarizationConnectorFactory.register('demo', () => new DemoConnector());

const service = new NotarizationService({
  config: {
    defaultNamespace: 'demo'
  }
});

const id = await service.create(
  {
    mode: NotarizationMode.Dynamic,
    data: new Uint8Array([1, 2, 3]),
    description: 'Created via service'
  },
  'demo',
  'did:example:controller'
);

const notarization = await service.get(id);
console.log(notarization.id); // notarization:urn:notarization:demo:1
```

```typescript
import { NotarizationMode } from '@twin.org/notarization-models';
import { NotarizationService } from '@twin.org/notarization-service';

const service = new NotarizationService({
  config: {
    defaultNamespace: 'demo'
  }
});

await service.update(
  {
    id: 'notarization:urn:notarization:demo:1',
    mode: NotarizationMode.Dynamic,
    dateCreated: '2026-01-01T00:00:00.000Z',
    data: new Uint8Array([9, 9, 9]),
    description: 'Updated via service'
  },
  'did:example:controller'
);

await service.transfer(
  'notarization:urn:notarization:demo:1',
  'did:example:recipient',
  'did:example:controller'
);

await service.remove('notarization:urn:notarization:demo:1', 'did:example:controller');
```

## generateRestRoutesNotarization

```typescript
import { ContextIdKeys, ContextIdStore } from '@twin.org/context';
import { ComponentFactory } from '@twin.org/core';
import {
  NotarizationMode,
  type INotarization,
  type INotarizationComponent
} from '@twin.org/notarization-models';
import { generateRestRoutesNotarization } from '@twin.org/notarization-service';

class DemoComponent implements INotarizationComponent {
  public className(): string {
    return 'DemoComponent';
  }

  public async create(
    notarization: Omit<INotarization, 'id' | 'dateCreated'>,
    namespace?: string,
    controllerIdentity?: string
  ): Promise<string> {
    return 'notarization:urn:notarization:demo:route-1';
  }

  public async get(id: string): Promise<INotarization> {
    return {
      id,
      mode: NotarizationMode.Dynamic,
      dateCreated: '2026-01-01T00:00:00.000Z',
      data: new Uint8Array([1]),
      description: 'Route response'
    };
  }

  public async remove(id: string, controllerIdentity?: string): Promise<void> {}
  public async update(notarization: INotarization, controllerIdentity?: string): Promise<void> {}
  public async transfer(
    id: string,
    recipientAddress: string,
    controllerIdentity?: string
  ): Promise<void> {}
}

ComponentFactory.register('notarization', () => new DemoComponent());

const routes = generateRestRoutesNotarization('/notarization', 'notarization');
const createRoute = routes.find(route => route.operationId === 'notarizationCreate');

const response = await ContextIdStore.run(
  { [ContextIdKeys.Organization]: 'did:example:organisation' },
  async () =>
    createRoute?.handler({} as never, {
      body: {
        mode: NotarizationMode.Dynamic,
        data: new Uint8Array([1, 2]),
        description: 'Created by route',
        namespace: 'demo'
      }
    })
);

console.log(response?.statusCode); // 201
```
