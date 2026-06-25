# Interface: INotarizationUpdateRequest

Request to update a notarization.

## Properties

### pathParams {#pathparams}

> **pathParams**: `object`

The request path parameters.

#### id

> **id**: `string`

The id of the notarization to update.

***

### body {#body}

> **body**: `Omit`\<[`INotarization`](INotarization.md), `"data"`\> & `object`

The request data.

#### Type Declaration

##### data

> **data**: `string`

The notarization data as a base64 encoded string.
