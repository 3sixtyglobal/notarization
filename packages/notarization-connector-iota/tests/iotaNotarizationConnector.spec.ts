// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Urn } from "@3sixty/core";
import { NotarizationMode } from "@3sixty/notarization-models";
import {
	TEST_ADDRESS_2,
	TEST_CLIENT_OPTIONS,
	TEST_EXPLORER_URL,
	TEST_MNEMONIC_NAME,
	TEST_NETWORK,
	TEST_USER_IDENTITY,
	TEST_USER_IDENTITY_2,
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

describe("IotaNotarizationConnector", () => {
	beforeAll(async () => {
		await setupTestEnv();

		connector = new IotaNotarizationConnector({
			config: {
				clientOptions: {
					...TEST_CLIENT_OPTIONS
				},
				vaultMnemonicId: TEST_MNEMONIC_NAME,
				network: TEST_NETWORK,
				enableCostLogging: false
			}
		});
	});

	test("Can create the service", async () => {
		expect(connector.className()).toBe("IotaNotarizationConnector");
	});

	test("Can create and get a dynamic notarization", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "dynamic description",
			immutableDescription: "immutable description",
			transferLockDateTime: new Date(Date.now() + 120000).toISOString()
		});

		debugOnChainLocation(id);

		const notarization = await connector.get(id);
		const urn = Urn.fromValidString(notarization.id);
		expect(urn.namespaceIdentifier()).toEqual("notarization");
		expect(urn.namespaceMethod()).toEqual("iota");
		expect(notarization.mode).toBe(NotarizationMode.Dynamic);
		expect(notarization.data.length).toBeGreaterThan(0);
	});

	test("Can create and get a locked notarization", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Locked,
			data: TEST_DATA,
			description: "locked description",
			immutableDescription: "locked immutable description"
		});

		debugOnChainLocation(id);

		const notarization = await connector.get(id);
		const urn = Urn.fromValidString(notarization.id);
		expect(urn.namespaceIdentifier()).toEqual("notarization");
		expect(urn.namespaceMethod()).toEqual("iota");
		expect(notarization.mode).toBe(NotarizationMode.Locked);
		expect(notarization.data).toEqual(TEST_DATA);

		await connector.remove(TEST_USER_IDENTITY, id);
		await expect(connector.get(id)).rejects.toThrow();
	});

	test("Should reject get with wrong namespace", async () => {
		await expect(
			connector.get(`notarization:${new Urn("entity-storage", "1234").toString()}`)
		).rejects.toThrow();
	});

	test("Should reject get with invalid id format", async () => {
		await expect(connector.get("not-a-urn")).rejects.toThrow();
	});

	test("Should reject update with wrong namespace", async () => {
		await expect(
			connector.update(TEST_USER_IDENTITY, {
				id: `notarization:${new Urn("entity-storage", "1234").toString()}`,
				mode: NotarizationMode.Dynamic,
				dateCreated: new Date().toISOString(),
				data: TEST_DATA,
				description: "invalid-update"
			})
		).rejects.toThrow();
	});

	test("Should reject remove with wrong namespace", async () => {
		await expect(
			connector.remove(
				TEST_USER_IDENTITY,
				`notarization:${new Urn("entity-storage", "1234").toString()}`
			)
		).rejects.toThrow();
	});

	test("Should reject transfer with wrong namespace", async () => {
		await expect(
			connector.transfer(
				TEST_USER_IDENTITY,
				`notarization:${new Urn("entity-storage", "1234").toString()}`,
				TEST_ADDRESS_2
			)
		).rejects.toThrow();
	});

	test("Ignores immutableDescription input changes during update", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "update-negative",
			immutableDescription: "immutable-original"
		});

		debugOnChainLocation(id);

		const created = await connector.get(id);

		await connector.update(TEST_USER_IDENTITY, {
			...created,
			mode: NotarizationMode.Dynamic,
			data: UPDATED_TEST_DATA,
			description: "updated-description",
			immutableDescription: "immutable-changed"
		});

		const updated = await connector.get(id);
		expect(updated.description).toEqual("updated-description");
		expect(updated.immutableDescription).toEqual("immutable-original");
	});

	test("Can update notarization", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "update-lifecycle",
			immutableDescription: "immutable-update-lifecycle"
		});

		debugOnChainLocation(id);

		const created = await connector.get(id);
		await connector.update(TEST_USER_IDENTITY, {
			...created,
			data: UPDATED_TEST_DATA,
			description: "update-lifecycle-updated"
		});

		const updated = await connector.get(id);
		expect(updated.description).toEqual("update-lifecycle-updated");
		expect(updated.data).toEqual(UPDATED_TEST_DATA);
	});

	test("Can transfer notarization", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "transfer-lifecycle",
			immutableDescription: "immutable-transfer-lifecycle"
		});

		debugOnChainLocation(id);

		await connector.transfer(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);

		const transferred = await connector.get(id);
		expect(transferred.description).toEqual("transfer-lifecycle");

		// Cleanup with the new owner to avoid leaving test objects on-chain.
		await connector.remove(TEST_USER_IDENTITY_2, id);
		await expect(connector.get(id)).rejects.toThrow();
	});

	test("Can remove notarization by owner", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "remove-lifecycle",
			immutableDescription: "immutable-remove-lifecycle"
		});

		debugOnChainLocation(id);

		await connector.transfer(TEST_USER_IDENTITY, id, TEST_ADDRESS_2);

		await connector.remove(TEST_USER_IDENTITY_2, id);
		await expect(connector.get(id)).rejects.toThrow();
	});

	test("Cannot update notarization by non-owner", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "non-owner-update",
			immutableDescription: "immutable-non-owner-update"
		});

		debugOnChainLocation(id);

		const created = await connector.get(id);

		await expect(
			connector.update(TEST_USER_IDENTITY_2, {
				...created,
				data: UPDATED_TEST_DATA,
				description: "non-owner-update-attempt"
			})
		).rejects.toThrow();

		await connector.remove(TEST_USER_IDENTITY, id);
		await expect(connector.get(id)).rejects.toThrow();
	});

	test("Cannot transfer notarization by non-owner", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "non-owner-transfer",
			immutableDescription: "immutable-non-owner-transfer"
		});

		debugOnChainLocation(id);

		await expect(connector.transfer(TEST_USER_IDENTITY_2, id, TEST_ADDRESS_2)).rejects.toThrow();

		await connector.remove(TEST_USER_IDENTITY, id);
		await expect(connector.get(id)).rejects.toThrow();
	});

	test("Cannot remove notarization by non-owner", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "non-owner-remove",
			immutableDescription: "immutable-non-owner-remove"
		});

		debugOnChainLocation(id);

		await expect(connector.remove(TEST_USER_IDENTITY_2, id)).rejects.toThrow();

		await connector.remove(TEST_USER_IDENTITY, id);
		await expect(connector.get(id)).rejects.toThrow();
	});

	test("Cannot transfer when transfer lock is active", async () => {
		const id = await connector.create(TEST_USER_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "transfer-locked",
			immutableDescription: "transfer-locked-immutable",
			transferLockDateTime: new Date(Date.now() + 120000).toISOString()
		});

		debugOnChainLocation(id);

		await expect(connector.transfer(TEST_USER_IDENTITY, id, TEST_ADDRESS_2)).rejects.toThrow();
	});
});
