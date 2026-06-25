# Interface: INotarizationComponent

Interface describing a notarization component.

## Extends

- `IComponent`

## Methods

### create() {#create}

> **create**(`notarization`, `namespace?`, `controllerIdentity?`): `Promise`\<`string`\>

Create a new notarization.

#### Parameters

##### notarization

`Omit`\<[`INotarization`](INotarization.md), `"id"` \| `"dateCreated"`\>

The notarization data without the generated fields.

##### namespace?

`string`

The namespace of the connector to use for the notarization, defaults to component configured namespace.

##### controllerIdentity?

`string`

The identity to perform the notarization operation with.

#### Returns

`Promise`\<`string`\>

The generated notarization id.

***

### get() {#get}

> **get**(`id`): `Promise`\<[`INotarization`](INotarization.md)\>

Get an existing notarization.

#### Parameters

##### id

`string`

The id of the notarization to get.

#### Returns

`Promise`\<[`INotarization`](INotarization.md)\>

The notarization.

***

### remove() {#remove}

> **remove**(`id`, `controllerIdentity?`): `Promise`\<`void`\>

Remove an existing notarization.

#### Parameters

##### id

`string`

The id of the notarization to remove.

##### controllerIdentity?

`string`

The identity to perform the notarization operation with.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the notarization has been removed.

***

### update() {#update}

> **update**(`notarization`, `controllerIdentity?`): `Promise`\<`void`\>

Update an existing notarization.

#### Parameters

##### notarization

[`INotarization`](INotarization.md)

The notarization to update.

##### controllerIdentity?

`string`

The identity to perform the notarization operation with.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the notarization has been updated.

***

### transfer() {#transfer}

> **transfer**(`id`, `recipientAddress`, `controllerIdentity?`): `Promise`\<`void`\>

Transfer an existing notarization.

#### Parameters

##### id

`string`

The id of the notarization to transfer.

##### recipientAddress

`string`

The recipient address.

##### controllerIdentity?

`string`

The identity to perform the notarization operation with.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the notarization has been transferred.
