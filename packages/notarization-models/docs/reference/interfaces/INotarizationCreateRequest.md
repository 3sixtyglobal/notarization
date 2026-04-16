# Interface: INotarizationCreateRequest

Request to create a notarization.

## Properties

### body {#body}

> **body**: `Omit`\<[`INotarization`](INotarization.md), `"id"` \| `"dateCreated"`\> & `object`

The request data.

#### Type Declaration

##### namespace?

> `optional` **namespace?**: `string`

The namespace of the connector to use for the notarization, defaults to component configured namespace.
