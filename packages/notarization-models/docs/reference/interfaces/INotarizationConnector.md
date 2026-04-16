# Interface: INotarizationConnector

Interface describing a notarization connector.

## Extends

- `IComponent`

## Methods

### create() {#create}

> **create**(`controllerIdentity`, `notarization`): `Promise`\<`string`\>

Create a new notarization.

#### Parameters

##### controllerIdentity

`string`

The identity to perform the notarization operation with.

##### notarization

`Omit`\<[`INotarization`](INotarization.md), `"id"` \| `"dateCreated"`\>

The notarization data without the generated fields.

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

> **remove**(`controllerIdentity`, `id`): `Promise`\<`void`\>

Remove an existing notarization.

#### Parameters

##### controllerIdentity

`string`

The identity to perform the notarization operation with.

##### id

`string`

The id of the notarization to remove.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### update() {#update}

> **update**(`controllerIdentity`, `notarization`): `Promise`\<`void`\>

Update an existing notarization.

#### Parameters

##### controllerIdentity

`string`

The identity to perform the notarization operation with.

##### notarization

[`INotarization`](INotarization.md)

The notarization to update.

#### Returns

`Promise`\<`void`\>

Nothing.

***

### transfer() {#transfer}

> **transfer**(`controllerIdentity`, `id`, `recipientAddress`): `Promise`\<`void`\>

Transfer an existing notarization.

#### Parameters

##### controllerIdentity

`string`

The identity to perform the notarization operation with.

##### id

`string`

The id of the notarization to transfer.

##### recipientAddress

`string`

The recipient address.

#### Returns

`Promise`\<`void`\>

Nothing.
