// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, Urn } from "@twin.org/core";
import { NotarizationMode } from "@twin.org/notarization-models";
import { notarizationStore, TEST_ADDRESS_2, TEST_NODE_IDENTITY } from "./setupTestEnv.js";
import { EntityStorageNotarizationConnector } from "../src/entityStorageNotarizationConnector.js";

const TEST_DATA = Converter.utf8ToBytes("notarization-test-data");

describe("EntityStorageNotarizationConnector", () => {
	beforeEach(async () => {
		await notarizationStore.empty();
	});

	test("Can create the service", async () => {
		const connector = new EntityStorageNotarizationConnector();
		await connector.create(TEST_NODE_IDENTITY, {
			mode: NotarizationMode.Dynamic,
			data: TEST_DATA,
			description: "test notarization"
		});
	});

	describe("Lock validation for Locked notarizations", () => {
		test("Should create locked notarization", async () => {
			const connector = new EntityStorageNotarizationConnector();
			const result = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Locked,
				data: TEST_DATA,
				description: "test notarization"
			});
			expect(result).toBeDefined();
			expect(result).toMatch(/^notarization:/);
		});

		test("Should allow deleteLock with only date", async () => {
			const connector = new EntityStorageNotarizationConnector();
			const result = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Locked,
				data: TEST_DATA,
				description: "test notarization",
				deleteLockDateTime: "2026-12-31T23:59:59Z"
			});
			expect(result).toBeDefined();
			expect(result).toMatch(/^notarization:/);
		});

		test("Should throw if deleteLock is not a valid date", async () => {
			const connector = new EntityStorageNotarizationConnector();
			await expect(
				connector.create(TEST_NODE_IDENTITY, {
					mode: NotarizationMode.Locked,
					data: TEST_DATA,
					description: "test notarization",
					deleteLockDateTime: "not-a-date"
				})
			).rejects.toThrow();
		});

		test("Should throw if deleteLock is empty", async () => {
			const connector = new EntityStorageNotarizationConnector();
			await expect(
				connector.create(TEST_NODE_IDENTITY, {
					mode: NotarizationMode.Locked,
					data: TEST_DATA,
					description: "test notarization",
					deleteLockDateTime: ""
				})
			).rejects.toThrow();
		});

		test("Should throw if transferLock is provided", async () => {
			const connector = new EntityStorageNotarizationConnector();
			await expect(
				connector.create(TEST_NODE_IDENTITY, {
					mode: NotarizationMode.Locked,
					data: TEST_DATA,
					description: "test notarization",
					transferLockDateTime: "2026-12-31T23:59:59Z"
				})
			).rejects.toThrow();
		});
	});

	describe("Lock validation for Dynamic notarizations", () => {
		test("Should create dynamic notarization", async () => {
			const connector = new EntityStorageNotarizationConnector();
			const result = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "test notarization"
			});
			expect(result).toBeDefined();
			expect(result).toMatch(/^notarization:/);
		});

		test("Should throw if deleteLock is provided", async () => {
			const connector = new EntityStorageNotarizationConnector();
			await expect(
				connector.create(TEST_NODE_IDENTITY, {
					mode: NotarizationMode.Dynamic,
					data: TEST_DATA,
					description: "test notarization",
					deleteLockDateTime: "2026-12-31T23:59:59Z"
				})
			).rejects.toThrow();
		});

		test("Should allow transferLock", async () => {
			const connector = new EntityStorageNotarizationConnector();
			const result = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "test notarization",
				transferLockDateTime: "2026-12-31T23:59:59Z"
			});
			expect(result).toBeDefined();
			expect(result).toMatch(/^notarization:/);
		});

		test("Should throw if transferLock date is not valid", async () => {
			const connector = new EntityStorageNotarizationConnector();
			await expect(
				connector.create(TEST_NODE_IDENTITY, {
					mode: NotarizationMode.Dynamic,
					data: TEST_DATA,
					description: "test notarization",
					transferLockDateTime: "not-a-date"
				})
			).rejects.toThrow();
		});

		test("Should create successfully without locks", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const result = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "test notarization"
			});
			expect(result).toBeDefined();
			expect(result).toMatch(/^notarization:/);

			const notarizationId = result.split(":").at(-1);
			expect(notarizationId).toBeDefined();

			expect((await notarizationStore.getStore()).length).toBe(1);
			const storedNotarization = (await notarizationStore.getStore())[0];

			expect(storedNotarization).toEqual({
				id: notarizationId,
				mode: NotarizationMode.Dynamic,
				dateCreated: expect.any(String),
				data: Converter.bytesToBase64(TEST_DATA),
				description: "test notarization",
				immutableDescription: undefined,
				dateModified: undefined,
				deleteLockDateTime: undefined,
				transferLockUntilDestroyed: undefined,
				transferLockDateTime: undefined,
				controllerIdentity: TEST_NODE_IDENTITY,
				owner: TEST_NODE_IDENTITY
			});
		});

		test("Should persist all applicable fields for fixed (locked) mode", async () => {
			const connector = new EntityStorageNotarizationConnector();
			const dateModified = "2026-01-01T00:00:00.000Z";
			const deleteLockDate = "2027-01-01T00:00:00Z";

			const result = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Locked,
				data: TEST_DATA,
				description: "locked description",
				immutableDescription: "locked immutable description",
				dateModified,
				deleteLockDateTime: deleteLockDate
			});

			const notarizationId = result.split(":").at(-1);
			expect(notarizationId).toBeDefined();

			expect((await notarizationStore.getStore()).length).toBe(1);
			const storedNotarization = (await notarizationStore.getStore())[0];

			expect(storedNotarization).toEqual({
				id: notarizationId,
				mode: NotarizationMode.Locked,
				dateCreated: expect.any(String),
				data: Converter.bytesToBase64(TEST_DATA),
				description: "locked description",
				immutableDescription: "locked immutable description",
				dateModified,
				deleteLockDateTime: deleteLockDate,
				transferLockUntilDestroyed: true,
				transferLockDateTime: undefined,
				controllerIdentity: TEST_NODE_IDENTITY,
				owner: TEST_NODE_IDENTITY
			});
		});

		test("Should persist all applicable fields for dynamic mode", async () => {
			const connector = new EntityStorageNotarizationConnector();
			const dateModified = "2026-02-01T00:00:00.000Z";
			const transferLockDate = "2027-02-01T00:00:00Z";

			const result = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "dynamic description",
				immutableDescription: "dynamic immutable description",
				dateModified,
				transferLockDateTime: transferLockDate
			});

			const notarizationId = result.split(":").at(-1);
			expect(notarizationId).toBeDefined();

			expect((await notarizationStore.getStore()).length).toBe(1);
			const storedNotarization = (await notarizationStore.getStore())[0];

			expect(storedNotarization).toEqual({
				id: notarizationId,
				mode: NotarizationMode.Dynamic,
				dateCreated: expect.any(String),
				data: Converter.bytesToBase64(TEST_DATA),
				description: "dynamic description",
				immutableDescription: "dynamic immutable description",
				dateModified,
				deleteLockDateTime: undefined,
				transferLockUntilDestroyed: undefined,
				transferLockDateTime: transferLockDate,
				controllerIdentity: TEST_NODE_IDENTITY,
				owner: TEST_NODE_IDENTITY
			});
		});

		test("Should populate default locks for fixed (locked) mode when none are set", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const result = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Locked,
				data: TEST_DATA,
				description: "locked without locks"
			});

			const notarizationId = result.split(":").at(-1);
			expect(notarizationId).toBeDefined();

			expect((await notarizationStore.getStore()).length).toBe(1);
			const storedNotarization = (await notarizationStore.getStore())[0];

			expect(storedNotarization).toEqual({
				id: notarizationId,
				mode: NotarizationMode.Locked,
				dateCreated: expect.any(String),
				data: Converter.bytesToBase64(TEST_DATA),
				description: "locked without locks",
				immutableDescription: undefined,
				dateModified: undefined,
				deleteLockDateTime: undefined,
				transferLockUntilDestroyed: true,
				transferLockDateTime: undefined,
				controllerIdentity: TEST_NODE_IDENTITY,
				owner: TEST_NODE_IDENTITY
			});
		});

		test("Should keep locks unset for dynamic mode when none are set", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const result = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "dynamic without locks"
			});

			const notarizationId = result.split(":").at(-1);
			expect(notarizationId).toBeDefined();

			expect((await notarizationStore.getStore()).length).toBe(1);
			const storedNotarization = (await notarizationStore.getStore())[0];

			expect(storedNotarization).toEqual({
				id: notarizationId,
				mode: NotarizationMode.Dynamic,
				dateCreated: expect.any(String),
				data: Converter.bytesToBase64(TEST_DATA),
				description: "dynamic without locks",
				immutableDescription: undefined,
				dateModified: undefined,
				deleteLockDateTime: undefined,
				transferLockUntilDestroyed: undefined,
				transferLockDateTime: undefined,
				controllerIdentity: TEST_NODE_IDENTITY,
				owner: TEST_NODE_IDENTITY
			});
		});

		test("Should resolve a notarization by URN id", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "resolve me"
			});

			const resolved = await connector.get(id);

			expect(resolved).toEqual({
				id,
				mode: NotarizationMode.Dynamic,
				dateCreated: expect.any(String),
				data: TEST_DATA,
				description: "resolve me",
				immutableDescription: undefined,
				dateModified: undefined,
				deleteLockDateTime: undefined,
				transferLockUntilDestroyed: undefined,
				transferLockDateTime: undefined
			});
		});

		test("Should throw when resolving a notarization with wrong namespace", async () => {
			const connector = new EntityStorageNotarizationConnector();

			await expect(connector.get("notarization:urn:notarization:iota:123")).rejects.toThrow();
		});

		test("Should throw getFailed when resolving a missing notarization", async () => {
			const connector = new EntityStorageNotarizationConnector();
			const missingId = `notarization:${new Urn("entity-storage", "missing-notarization").toString()}`;

			await expect(connector.get(missingId)).rejects.toThrow("getFailed");
		});
	});

	describe("Remove notarizations", () => {
		test("Should throw removeFailed when controller identity does not match", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "remove mismatch"
			});

			await expect(connector.remove("someone-else", id)).rejects.toThrow("removeFailed");
			expect((await notarizationStore.getStore()).length).toBe(1);
		});

		test("Should remove notarization when controller identity matches", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "remove success"
			});

			expect((await notarizationStore.getStore()).length).toBe(1);

			await connector.remove(TEST_NODE_IDENTITY, id);

			expect((await notarizationStore.getStore()).length).toBe(0);
		});

		test("Should remove dynamic notarization even when transfer lock date is in the future", async () => {
			const connector = new EntityStorageNotarizationConnector();
			const futureDate = new Date(Date.now() + 60_000).toISOString();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "remove blocked by transfer lock",
				transferLockDateTime: futureDate
			});

			await connector.remove(TEST_NODE_IDENTITY, id);
			expect((await notarizationStore.getStore()).length).toBe(0);
		});
	});

	describe("Update notarizations", () => {
		test("Should throw updateFailed when controller identity does not match", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "original description"
			});

			const notarization = await connector.get(id);

			await expect(
				connector.update("someone-else", {
					...notarization,
					description: "updated description"
				})
			).rejects.toThrow("updateFailed");
		});

		test("Should throw updateFailed when notarization is locked", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Locked,
				data: TEST_DATA,
				description: "locked notarization",
				deleteLockDateTime: "2026-12-31T23:59:59Z"
			});

			const notarization = await connector.get(id);

			await expect(
				connector.update(TEST_NODE_IDENTITY, {
					...notarization,
					description: "new description"
				})
			).rejects.toThrow("updateFailed");
		});

		test("Should successfully update data", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "modify data"
			});

			const notarization = await connector.get(id);
			expect(notarization.data).toEqual(TEST_DATA);

			const newData = new TextEncoder().encode("updated data");

			await connector.update(TEST_NODE_IDENTITY, {
				...notarization,
				data: newData
			});

			const retrieved = await connector.get(id);
			expect(retrieved.data).toEqual(newData);
			expect(retrieved.dateModified).toBeDefined();
		});

		test("Should throw updateFailed when trying to modify immutableDescription", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "mutable",
				immutableDescription: "original immutable description"
			});

			const notarization = await connector.get(id);

			await expect(
				connector.update(TEST_NODE_IDENTITY, {
					...notarization,
					immutableDescription: "modified immutable description"
				})
			).rejects.toThrow("updateFailed");
		});

		test("Should successfully update description", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "original description"
			});

			const notarization = await connector.get(id);
			expect(notarization.description).toBe("original description");
			expect(notarization.dateModified).toBeUndefined();

			const updatedNotarization = {
				...notarization,
				description: "updated description"
			};

			await connector.update(TEST_NODE_IDENTITY, updatedNotarization);

			const retrieved = await connector.get(id);
			expect(retrieved.description).toBe("updated description");
			expect(retrieved.dateModified).toBeDefined();
		});

		test("Should successfully clear description", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "original description"
			});

			const notarization = await connector.get(id);

			await connector.update(TEST_NODE_IDENTITY, {
				...notarization,
				description: undefined
			});

			const retrieved = await connector.get(id);
			expect(retrieved.description).toBeUndefined();
			expect(retrieved.dateModified).toBeDefined();
		});
	});

	describe("Transfer notarizations", () => {
		test("Should throw transferFailed when controller identity does not match", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "transfer mismatch"
			});

			await expect(connector.transfer("someone-else", id, TEST_ADDRESS_2)).rejects.toThrow(
				"transferFailed"
			);

			expect((await notarizationStore.getStore())[0]?.owner).toBe(TEST_NODE_IDENTITY);
		});

		test("Should update owner when transfer succeeds", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "transfer success"
			});

			const recipientAddress = TEST_ADDRESS_2;

			await connector.transfer(TEST_NODE_IDENTITY, id, recipientAddress);

			expect((await notarizationStore.getStore())[0]?.owner).toBe(recipientAddress);
			expect((await notarizationStore.getStore())[0]?.controllerIdentity).toBe(TEST_NODE_IDENTITY);
		});

		test("Should throw transferFailed when notarization is missing", async () => {
			const connector = new EntityStorageNotarizationConnector();
			const missingId = `notarization:${new Urn("entity-storage", "missing-transfer").toString()}`;

			await expect(
				connector.transfer(TEST_NODE_IDENTITY, missingId, TEST_ADDRESS_2)
			).rejects.toThrow("transferFailed");
		});

		test("Should throw transferFailed when transfer lock is active until destroyed", async () => {
			const connector = new EntityStorageNotarizationConnector();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "transfer lock active",
				transferLockUntilDestroyed: true
			});

			await expect(connector.transfer(TEST_NODE_IDENTITY, id, TEST_ADDRESS_2)).rejects.toThrow(
				"transferFailed"
			);

			expect((await notarizationStore.getStore())[0]?.owner).toBe(TEST_NODE_IDENTITY);
		});

		test("Should throw transferFailed when transfer lock date is in the future", async () => {
			const connector = new EntityStorageNotarizationConnector();
			const futureDate = new Date(Date.now() + 60_000).toISOString();

			const id = await connector.create(TEST_NODE_IDENTITY, {
				mode: NotarizationMode.Dynamic,
				data: TEST_DATA,
				description: "future transfer lock",
				transferLockDateTime: futureDate
			});

			await expect(connector.transfer(TEST_NODE_IDENTITY, id, TEST_ADDRESS_2)).rejects.toThrow(
				"transferFailed"
			);

			expect((await notarizationStore.getStore())[0]?.owner).toBe(TEST_NODE_IDENTITY);
		});
	});
});
