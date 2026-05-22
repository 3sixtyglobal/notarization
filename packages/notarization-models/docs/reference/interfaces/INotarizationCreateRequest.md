# Interface: INotarizationCreateRequest

Request to create a notarization.

## Properties

### body {#body}

> **body**: `Omit`\<[`INotarization`](INotarization.md), `"id"` \| `"dateCreated"` \| `"data"`\> & `object`

The request data.

#### Type Declaration

##### data

> **data**: `string`

The notarization data as a base64 encoded string.

##### namespace?

> `optional` **namespace?**: `string`

The namespace of the connector to use for the notarization, defaults to component configured namespace.
