# Class: NotarizationRestClient

Client for performing notarization operations through to REST endpoints.

## Extends

- `BaseRestClient`

## Implements

- `INotarizationComponent`

## Constructors

### Constructor

> **new NotarizationRestClient**(`config`): `NotarizationRestClient`

Create a new instance of NotarizationRestClient.

#### Parameters

##### config

`IBaseRestClientConfig`

The configuration for the client.

#### Returns

`NotarizationRestClient`

#### Overrides

`BaseRestClient.constructor`

## Properties

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

`INotarizationComponent.className`

***

### create() {#create}

> **create**(`notarization`, `namespace?`): `Promise`\<`string`\>

Create a new notarization.

#### Parameters

##### notarization

`Omit`\<`INotarization`, `"id"` \| `"dateCreated"`\>

The notarization data without generated fields.

##### namespace?

`string`

The namespace of the connector to use for the notarization, defaults to service configured namespace.

#### Returns

`Promise`\<`string`\>

The generated notarization id.

#### Implementation of

`INotarizationComponent.create`

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

`INotarizationComponent.get`

***

### remove() {#remove}

> **remove**(`id`): `Promise`\<`void`\>

Remove an existing notarization.

#### Parameters

##### id

`string`

The id of the notarization to remove.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`INotarizationComponent.remove`

***

### update() {#update}

> **update**(`notarization`): `Promise`\<`void`\>

Update an existing notarization.

#### Parameters

##### notarization

`INotarization`

The notarization to update.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`INotarizationComponent.update`

***

### transfer() {#transfer}

> **transfer**(`id`, `recipientAddress`): `Promise`\<`void`\>

Transfer an existing notarization.

#### Parameters

##### id

`string`

The id of the notarization to transfer.

##### recipientAddress

`string`

The recipient address.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`INotarizationComponent.transfer`
