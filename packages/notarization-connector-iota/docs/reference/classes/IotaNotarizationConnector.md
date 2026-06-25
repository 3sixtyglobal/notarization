# Class: IotaNotarizationConnector

IOTA on-chain connector for notarization operations.

## Implements

- `INotarizationConnector`

## Constructors

### Constructor

> **new IotaNotarizationConnector**(`options`): `IotaNotarizationConnector`

Create a new instance of IotaNotarizationConnector.

#### Parameters

##### options

[`IIotaNotarizationConnectorConstructorOptions`](../interfaces/IIotaNotarizationConnectorConstructorOptions.md)

The options for the connector.

#### Returns

`IotaNotarizationConnector`

## Properties

### NAMESPACE {#namespace}

> `readonly` `static` **NAMESPACE**: `string` = `"iota"`

The namespace supported by the connector.

***

### CLASS\_NAME {#class_name}

> `readonly` `static` **CLASS\_NAME**: `string`

Runtime name for the class.

## Methods

### className() {#classname}

> **className**(): `string`

Returns the class name of the component.

#### Returns

`string`

The class name of the component.

#### Implementation of

`INotarizationConnector.className`

***

### create() {#create}

> **create**(`controllerIdentity`, `notarization`): `Promise`\<`string`\>

Create a new notarization.

#### Parameters

##### controllerIdentity

`string`

The identity to perform the notarization operation with.

##### notarization

`Omit`\<`INotarization`, `"id"` \| `"dateCreated"`\>

The notarization data without generated fields.

#### Returns

`Promise`\<`string`\>

The generated notarization id.

#### Implementation of

`INotarizationConnector.create`

***

### get() {#get}

> **get**(`id`): `Promise`\<`INotarization`\>

Get an existing notarization.

#### Parameters

##### id

`string`

The id of the notarization to get.

#### Returns

`Promise`\<`INotarization`\>

The notarization.

#### Implementation of

`INotarizationConnector.get`

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

A promise that resolves when the notarization has been removed.

#### Implementation of

`INotarizationConnector.remove`

***

### update() {#update}

> **update**(`controllerIdentity`, `notarization`): `Promise`\<`void`\>

Update an existing notarization.

#### Parameters

##### controllerIdentity

`string`

The identity to perform the notarization operation with.

##### notarization

`INotarization`

The notarization to update.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the notarization has been updated.

#### Implementation of

`INotarizationConnector.update`

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

A promise that resolves when the notarization has been transferred.

#### Implementation of

`INotarizationConnector.transfer`
