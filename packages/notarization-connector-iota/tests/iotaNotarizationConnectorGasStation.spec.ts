// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Urn } from "@3sixty/core";
import { Bip39 } from "@3sixty/crypto";
import { NotarizationMode } from "@3sixty/notarization-models";
import {
	TEST_ADDRESS_2,
	TEST_CLIENT_OPTIONS,
	TEST_EXPLORER_URL,
	TEST_GAS_STATION_AUTH_TOKEN,
	TEST_GAS_STATION_URL,
	TEST_MNEMONIC_NAME,
	TEST_NETWORK,
	TEST_USER_IDENTITY,
	TEST_USER_IDENTITY_2,
	TEST_VAULT_CONNECTOR,
	setupTestEnv
} from "./setupTestEnv.js";
import { IotaNotarizationConnector } from "../src/iotaNotarizationConnector.js";

const TEST_DATA = new Uint8Array([1, 2, 3, 4]);
const UPDATED_TEST_DATA = new Uint8Array([9, 8, 7, 6]);

let connector: IotaNotarizationConnector;

function debugOnChainLocation(id: string): void {
	const urn = Urn.fromValidString(id);
	const objectId = urn.namespaceSpecific(1);
	console.debug("Created", `${TEST_EXPLORER_URL}object/${objectId}?network=${TEST_NETWORK}`);
}

describe("IotaNotarizationConnector with Gas Station Sponsorship", () => {
	beforeAll(async () => {
		await setupTestEnv();

		connector = new IotaNotarizationConnector({
			config: {
				clientOptions: {
					...TEST_CLIENT_OPTIONS
				},
				gasStation: {
					gasStationUrl: TEST_GAS_STATION_URL,
					gasStationAuthToken: TEST_GAS_STATION_AUTH_TOKEN
				},
				vaultMnemonicId: TEST_MNEMONIC_NAME,
				network: TEST_NETWORK,
				enableCostLogging: false
			}
		});
	});

	test("Can create notarization with gas station sponsorship", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "gas station sponsored",
			immutableDescription: "immutable gas station"
		});

		debugOnChainLocation(id);

		const notarization = await connector.get(id);
		expect(notarization.mode).toBe(NotarizationMode.Dynamic);
		expect(notarization.data).toEqual(TEST_DATA);

		await connector.remove(TEST_USER_IDENTITY, id);
	});

	test("Can update notarization with gas station sponsorship", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "gas station update test",
			immutableDescription: "immutable"
		});

		debugOnChainLocation(id);

		const created = await connector.get(id);
		await connector.update(TEST_USER_IDENTITY, {
			...created,
			data: UPDATED_TEST_DATA,
			description: "gas station update complete"
		});

		const updated = await connector.get(id);
		expect(updated.description).toEqual("gas station update complete");
		expect(updated.data).toEqual(UPDATED_TEST_DATA);

		await connector.remove(TEST_USER_IDENTITY, id);
	});

	test("Can transfer notarization with gas station sponsorship", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "gas station transfer test",
			immutableDescription: "immutable"
		});

		debugOnChainLocation(id);

		await connector.transfer(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);

		const transferred = await connector.get(id);
		expect(transferred.description).toEqual("gas station transfer test");

		await connector.remove(TEST_USER_IDENTITY_2, id);
		await expect(connector.get(id)).rejects.toThrow();
	});

	test("Can remove notarization with gas station sponsorship", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "gas station remove test",
			immutableDescription: "immutable"
		});

		debugOnChainLocation(id);

		await connector.remove(TEST_USER_IDENTITY, id);
		await expect(connector.get(id)).rejects.toThrow();
	});

	test("Can create locked notarization with gas station sponsorship", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Locked,
			data: TEST_DATA,
			description: "gas station locked",
			immutableDescription: "immutable locked"
		});

		debugOnChainLocation(id);

		const notarization = await connector.get(id);
		expect(notarization.mode).toBe(NotarizationMode.Locked);
		expect(notarization.data).toEqual(TEST_DATA);

		await connector.remove(TEST_USER_IDENTITY, id);
	});

	test("Can create notarization for a sender whose wallet holds no coins", async () => {
		// The sponsored path must not depend on the sender owning coins: this identity's
		// wallet is freshly generated and never funded.
		const zeroBalanceIdentity = "test-notarization-zero-balance";
		await TEST_VAULT_CONNECTOR.setSecret(
			`${zeroBalanceIdentity}/${TEST_MNEMONIC_NAME}`,
			Bip39.randomMnemonic()
		);

		const id = await connector.create(zeroBalanceIdentity, {
			mode: NotarizationMode.Locked,
			data: TEST_DATA,
			description: "gas station zero balance",
			immutableDescription: "immutable zero balance"
		});

		debugOnChainLocation(id);

		const notarization = await connector.get(id);
		expect(notarization.mode).toBe(NotarizationMode.Locked);
		expect(notarization.data).toEqual(TEST_DATA);

		await connector.remove(zeroBalanceIdentity, id);
	});
});
