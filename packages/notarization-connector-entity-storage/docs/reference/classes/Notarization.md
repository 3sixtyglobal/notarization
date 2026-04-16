# Class: Notarization

Class describing a notarization record.

## Constructors

### Constructor

> **new Notarization**(): `Notarization`

#### Returns

`Notarization`

## Properties

### id {#id}

> **id**: `string`

The identity of the notarization record.

***

### mode {#mode}

> **mode**: `NotarizationMode`

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

> **data**: `string`

The notarization data as a base64 string.

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

***

### transferLockUntilDestroyed? {#transferlockuntildestroyed}

> `optional` **transferLockUntilDestroyed?**: `boolean`

An optional flag indicating transfer lock is active until notarization destruction.

***

### transferLockDateTime? {#transferlockdatetime}

> `optional` **transferLockDateTime?**: `string`

An optional transfer lock date-time, in ISO 8601 format.

***

### controllerIdentity {#controlleridentity}

> **controllerIdentity**: `string`

The controller identity.

***

### owner {#owner}

> **owner**: `string`

The owner of the notarization.
