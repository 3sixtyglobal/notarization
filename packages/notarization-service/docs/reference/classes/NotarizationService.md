# Class: NotarizationService

Service for notarization operations.

## Implements

- `INotarizationComponent`

## Constructors

### Constructor

> **new NotarizationService**(`options?`): `NotarizationService`

Create a new instance of NotarizationService.

#### Parameters

##### options?

[`INotarizationServiceConstructorOptions`](../interfaces/INotarizationServiceConstructorOptions.md)

The constructor options.

#### Returns

`NotarizationService`

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

> **create**(`notarization`, `namespace?`, `controllerIdentity?`): `Promise`\<`string`\>

Create a new notarization.

#### Parameters

##### notarization

`Omit`\<`INotarization`, `"id"` \| `"dateCreated"`\>

The notarization data without generated fields.

##### namespace?

`string`

The namespace of the connector to use for the notarization, defaults to service configured namespace.

##### controllerIdentity?

`string`

The identity to perform the notarization operation with.

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

Nothing.

#### Implementation of

`INotarizationComponent.remove`

***

### update() {#update}

> **update**(`notarization`, `controllerIdentity?`): `Promise`\<`void`\>

Update an existing notarization.

#### Parameters

##### notarization

`INotarization`

The notarization to update.

##### controllerIdentity?

`string`

The identity to perform the notarization operation with.

#### Returns

`Promise`\<`void`\>

Nothing.

#### Implementation of

`INotarizationComponent.update`

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

Nothing.

#### Implementation of

`INotarizationComponent.transfer`
