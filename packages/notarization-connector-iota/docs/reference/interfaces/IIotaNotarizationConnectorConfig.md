# Interface: IIotaNotarizationConnectorConfig

Configuration for the IOTA Notarization Connector.

## Extends

- `IIotaConfig`

## Properties

### clientOptions {#clientoptions}

> **clientOptions**: `NetworkOrTransport`

The configuration for the client.

#### Inherited from

`IIotaConfig.clientOptions`

***

### network {#network}

> **network**: `string`

The network the operations are being performed on.

#### Inherited from

`IIotaConfig.network`

***

### vaultMnemonicId? {#vaultmnemonicid}

> `optional` **vaultMnemonicId?**: `string`

The id of the entry in the vault containing the mnemonic.

#### Default

```ts
mnemonic
```

#### Inherited from

`IIotaConfig.vaultMnemonicId`

***

### vaultSeedId? {#vaultseedid}

> `optional` **vaultSeedId?**: `string`

The id of the entry in the vault containing the seed.

#### Default

```ts
seed
```

#### Inherited from

`IIotaConfig.vaultSeedId`

***

### coinType? {#cointype}

> `optional` **coinType?**: `number`

The coin type.

#### Default

```ts
IOTA 4218
```

#### Inherited from

`IIotaConfig.coinType`

***

### maxAddressScanRange? {#maxaddressscanrange}

> `optional` **maxAddressScanRange?**: `number`

The maximum range to scan for addresses.

#### Default

```ts
1000
```

#### Inherited from

`IIotaConfig.maxAddressScanRange`

***

### inclusionTimeoutSeconds? {#inclusiontimeoutseconds}

> `optional` **inclusionTimeoutSeconds?**: `number`

The length of time to wait for the inclusion of a transaction in seconds.

#### Default

```ts
60
```

#### Inherited from

`IIotaConfig.inclusionTimeoutSeconds`

***

### gasStation? {#gasstation}

> `optional` **gasStation?**: `IGasStationConfig`

Gas station configuration for sponsored transactions.
If provided, transactions will be processed through the gas station.

#### Inherited from

`IIotaConfig.gasStation`

***

### gasBudget? {#gasbudget}

> `optional` **gasBudget?**: `number`

The default gas budget for all transactions (including sponsored and direct).

#### Default

```ts
50000000
```

#### Inherited from

`IIotaConfig.gasBudget`

***

### gasReservationDuration? {#gasreservationduration}

> `optional` **gasReservationDuration?**: `number`

The default gas reservation duration in seconds for all transactions (including sponsored and direct).

#### Default

```ts
60
```

#### Inherited from

`IIotaConfig.gasReservationDuration`

***

### objectLockRetries? {#objectlockretries}

> `optional` **objectLockRetries?**: `number`

The number of times to retry a transaction that is rejected because one or more of its owned
objects is reserved by another in-flight transaction.

#### Default

```ts
3
```

#### Inherited from

`IIotaConfig.objectLockRetries`

***

### objectLockRetryDelayMs? {#objectlockretrydelayms}

> `optional` **objectLockRetryDelayMs?**: `number`

The base delay in milliseconds between object-lock retries; the delay grows exponentially
with each attempt.

#### Default

```ts
1000
```

#### Inherited from

`IIotaConfig.objectLockRetryDelayMs`

***

### accountAddressIndex? {#accountaddressindex}

> `optional` **accountAddressIndex?**: `number`

The account address index to use when performing notarization operations.

#### Default

```ts
0
```

***

### walletAddressIndex? {#walletaddressindex}

> `optional` **walletAddressIndex?**: `number`

The wallet address index to use when performing notarization operations.

#### Default

```ts
0
```

***

### enableCostLogging? {#enablecostlogging}

> `optional` **enableCostLogging?**: `boolean`

Enable cost logging.

#### Default

```ts
false
```

#### Overrides

`IIotaConfig.enableCostLogging`
