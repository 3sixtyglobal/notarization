# Interface: INotarization

Interface describing a notarization.

## Properties

### id {#id}

> **id**: `string`

The unique identifier of the notarization.

***

### mode {#mode}

> **mode**: [`NotarizationMode`](../type-aliases/NotarizationMode.md)

The notarization mode.

***

### dateCreated {#datecreated}

> **dateCreated**: `string`

The date and time when the notarization was created, in ISO 8601 format.

***

### dateModified? {#datemodified}

> `optional` **dateModified?**: `string`

The date and time when the notarization was last modified, in ISO 8601 format.

***

### data {#data}

> **data**: `Uint8Array`

The notarization data as a byte array.

***

### immutableDescription? {#immutabledescription}

> `optional` **immutableDescription?**: `string`

An optional description of the notarization that cannot be changed after creation.

***

### description? {#description}

> `optional` **description?**: `string`

An optional description of the notarization that can be modified until the notarization is locked.

***

### deleteLockDateTime? {#deletelockdatetime}

> `optional` **deleteLockDateTime?**: `string`

An optional lock date, in ISO 8601 format, that prevents deletion until the date is reached.
Used only in Locked Notarization, it prevents the object from being deleted until the lock expires.

***

### transferLockUntilDestroyed? {#transferlockuntildestroyed}

> `optional` **transferLockUntilDestroyed?**: `boolean`

An optional flag indicating transfer lock is active until the notarization is destroyed.
Used only in Dynamic Notarization.

***

### transferLockDateTime? {#transferlockdatetime}

> `optional` **transferLockDateTime?**: `string`

An optional transfer lock date-time, in ISO 8601 format.
Used only in Dynamic Notarization.
