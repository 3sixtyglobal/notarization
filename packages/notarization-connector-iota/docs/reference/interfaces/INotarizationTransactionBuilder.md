# Interface: INotarizationTransactionBuilder

Structural view of the vendor transaction builder used to post notarization transactions.

## Properties

### transaction {#transaction}

> `readonly` **transaction**: `object`

The transaction operation held by the builder.

#### buildProgrammableTransaction()

> **buildProgrammableTransaction**(`client`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Build the gas-free programmable transaction bytes for the operation.

##### Parameters

###### client

`NotarizationClient`

The notarization client to build with.

##### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

The BCS serialization of the programmable transaction.

## Methods

### build() {#build}

> **build**(`client`): `Promise`\<\[`Uint8Array`\<`ArrayBufferLike`\>, `string`[], `unknown`\]\>

Build the full transaction bytes and signatures for direct posting.

#### Parameters

##### client

`NotarizationClient`

The notarization client to build with.

#### Returns

`Promise`\<\[`Uint8Array`\<`ArrayBufferLike`\>, `string`[], `unknown`\]\>

The transaction bytes, signatures and operation.
