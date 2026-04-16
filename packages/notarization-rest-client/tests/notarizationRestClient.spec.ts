// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ICreatedResponse, INoContentResponse } from "@twin.org/api-models";
import { NotarizationMode } from "@twin.org/notarization-models";
import { HeaderTypes } from "@twin.org/web";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { NotarizationRestClient } from "../src/notarizationRestClient.js";

describe("NotarizationRestClient", () => {
	let client: NotarizationRestClient;

	beforeEach(() => {
		client = new NotarizationRestClient({ endpoint: "http://localhost:8080" });
	});

	test("Can create an instance", () => {
		expect(client).toBeDefined();
	});

	test("create sends POST and returns id from location header", async () => {
		const fetchSpy = vi.spyOn(client, "fetch").mockResolvedValue({
			statusCode: 201,
			headers: { [HeaderTypes.Location]: "notarization:default:abc123" }
		} as ICreatedResponse);

		const id = await client.create({ mode: "dynamic", data: new Uint8Array([1, 2, 3]) });

		expect(fetchSpy).toHaveBeenCalledWith(
			"/",
			"POST",
			expect.objectContaining({
				body: expect.objectContaining({ mode: "dynamic" })
			})
		);
		expect(id).toBe("notarization:default:abc123");
	});

	test("create includes namespace in request body when provided", async () => {
		const fetchSpy = vi.spyOn(client, "fetch").mockResolvedValue({
			statusCode: 201,
			headers: { [HeaderTypes.Location]: "notarization:custom:xyz456" }
		} as ICreatedResponse);

		const id = await client.create({ mode: "dynamic", data: new Uint8Array() }, "custom-namespace");

		expect(fetchSpy).toHaveBeenCalledWith(
			"/",
			"POST",
			expect.objectContaining({
				body: expect.objectContaining({ namespace: "custom-namespace" })
			})
		);
		expect(id).toBe("notarization:custom:xyz456");
	});

	test("create throws when notarization is undefined", async () => {
		await expect(client.create(undefined as never)).rejects.toThrow();
	});

	test("create throws when location header is missing", async () => {
		vi.spyOn(client, "fetch").mockResolvedValue({
			statusCode: 201,
			headers: {}
		} as ICreatedResponse);

		await expect(
			client.create({ mode: "dynamic", data: new Uint8Array([1, 2, 3]) })
		).rejects.toThrow();
	});

	test("get sends GET and returns notarization", async () => {
		const mockNotarization = {
			id: "notarization:default:abc123",
			mode: NotarizationMode.Dynamic,
			dateCreated: "2026-01-01T00:00:00.000Z",
			data: new Uint8Array()
		};
		const fetchSpy = vi.spyOn(client, "fetch").mockResolvedValue({
			body: mockNotarization
		});

		const result = await client.get("notarization:default:abc123");

		expect(fetchSpy).toHaveBeenCalledWith(
			"/:id",
			"GET",
			expect.objectContaining({ pathParams: { id: "notarization:default:abc123" } })
		);
		expect(result).toEqual(mockNotarization);
	});

	test("get throws when id is empty", async () => {
		await expect(client.get("")).rejects.toThrow();
	});

	test("remove sends DELETE with correct path params", async () => {
		const fetchSpy = vi
			.spyOn(client, "fetch")
			.mockResolvedValue({ statusCode: 204 } as INoContentResponse);

		await client.remove("notarization:default:abc123");

		expect(fetchSpy).toHaveBeenCalledWith(
			"/:id",
			"DELETE",
			expect.objectContaining({ pathParams: { id: "notarization:default:abc123" } })
		);
	});

	test("remove throws when id is empty", async () => {
		await expect(client.remove("")).rejects.toThrow();
	});

	test("update sends PUT with id in path and body", async () => {
		const fetchSpy = vi
			.spyOn(client, "fetch")
			.mockResolvedValue({ statusCode: 204 } as INoContentResponse);

		const notarization = {
			id: "notarization:default:abc123",
			mode: NotarizationMode.Dynamic,
			dateCreated: "2026-01-01T00:00:00.000Z",
			data: new Uint8Array()
		};

		await client.update(notarization);

		expect(fetchSpy).toHaveBeenCalledWith(
			"/:id",
			"PUT",
			expect.objectContaining({
				pathParams: { id: "notarization:default:abc123" },
				body: notarization
			})
		);
	});

	test("update throws when notarization is undefined", async () => {
		await expect(client.update(undefined as never)).rejects.toThrow();
	});

	test("transfer sends POST with recipientAddress in body", async () => {
		const fetchSpy = vi
			.spyOn(client, "fetch")
			.mockResolvedValue({ statusCode: 204 } as INoContentResponse);

		await client.transfer("notarization:default:abc123", "recipient-address-1");

		expect(fetchSpy).toHaveBeenCalledWith(
			"/:id/transfer",
			"POST",
			expect.objectContaining({
				pathParams: { id: "notarization:default:abc123" },
				body: { recipientAddress: "recipient-address-1" }
			})
		);
	});

	test("transfer throws when id is empty", async () => {
		await expect(client.transfer("", "recipient-address-1")).rejects.toThrow();
	});

	test("transfer throws when recipientAddress is empty", async () => {
		await expect(client.transfer("notarization:default:abc123", "")).rejects.toThrow();
	});
});
