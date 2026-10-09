// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, GuardError } from "@3sixty/core";
import type { INotarization } from "@3sixty/notarization-models";
import { NotarizationMode } from "@3sixty/notarization-models";
import { HttpMethod } from "@3sixty/web";
import { NotarizationRestClient } from "../src/notarizationRestClient.js";
import {
	createdResponse,
	jsonResponse,
	noContentResponse,
	setupFetchMock,
	teardownFetchMock
} from "./helpers/restClientTestHelpers.js";

// OpenAPI spec: ../../notarization-service/docs/open-api/spec.json
const ENDPOINT = "http://localhost:8080";
const PREFIX = "notarization";

const NOTARIZATION_ID = "notarization:default:abc123";
const LOCATION = `${ENDPOINT}/${PREFIX}/${NOTARIZATION_ID}`;
const RECIPIENT_ADDRESS = "iota1qp9x0q5ml8ytxzq4p7qkp3tsegzzpkqk5zwtnyr";

const TEST_DATA_BYTES = new Uint8Array([1, 2, 3, 4, 5]);
const TEST_DATA_BASE64 = Converter.bytesToBase64(TEST_DATA_BYTES);

const TEST_NOTARIZATION_CREATE: Omit<INotarization, "id" | "dateCreated"> = {
	mode: NotarizationMode.Dynamic,
	data: TEST_DATA_BYTES,
	description: "Test notarization"
};

const TEST_NOTARIZATION: INotarization = {
	id: NOTARIZATION_ID,
	mode: NotarizationMode.Dynamic,
	dateCreated: "2026-01-01T00:00:00.000Z",
	data: TEST_DATA_BYTES,
	description: "Test notarization"
};

const TEST_NOTARIZATION_RESPONSE = {
	id: NOTARIZATION_ID,
	mode: NotarizationMode.Dynamic,
	dateCreated: "2026-01-01T00:00:00.000Z",
	data: TEST_DATA_BASE64,
	description: "Test notarization"
};

const fetchMock = vi.fn();

describe("NotarizationRestClient", () => {
	let client: NotarizationRestClient;

	beforeEach(() => {
		setupFetchMock(fetchMock);
		client = new NotarizationRestClient({ endpoint: ENDPOINT });
	});

	afterEach(() => {
		teardownFetchMock(fetchMock);
	});

	describe("create", () => {
		test("throws when notarization is undefined", async () => {
			await expect(client.create(undefined as never)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.objectUndefined"
			});
		});

		test("sends POST to /{prefix}", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			await client.create(TEST_NOTARIZATION_CREATE);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends mode in the request body", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			await client.create(TEST_NOTARIZATION_CREATE);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.mode).toBe(NotarizationMode.Dynamic);
		});

		test("converts data bytes to base64 in the request body", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			await client.create(TEST_NOTARIZATION_CREATE);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.data).toBe(TEST_DATA_BASE64);
		});

		test("includes namespace in the request body when provided", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			await client.create(TEST_NOTARIZATION_CREATE, "custom-namespace");

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.namespace).toBe("custom-namespace");
		});

		test("returns the Location header value as the notarization id", async () => {
			fetchMock.mockResolvedValueOnce(createdResponse(LOCATION));

			const id = await client.create(TEST_NOTARIZATION_CREATE);

			expect(id).toBe(NOTARIZATION_ID);
		});
	});

	describe("get", () => {
		test("throws when id is empty", async () => {
			await expect(client.get("")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends GET to /{prefix}/:id", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_NOTARIZATION_RESPONSE));

			await client.get(NOTARIZATION_ID);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${NOTARIZATION_ID}`);
			expect(options.method).toBe(HttpMethod.GET);
		});

		test("returns notarization with data decoded from base64", async () => {
			fetchMock.mockResolvedValueOnce(jsonResponse(TEST_NOTARIZATION_RESPONSE));

			const result = await client.get(NOTARIZATION_ID);

			expect(result.id).toBe(NOTARIZATION_ID);
			expect(result.mode).toBe(NotarizationMode.Dynamic);
			expect(result.data).toEqual(TEST_DATA_BYTES);
		});
	});

	describe("remove", () => {
		test("throws when id is empty", async () => {
			await expect(client.remove("")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends DELETE to /{prefix}/:id", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.remove(NOTARIZATION_ID);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${NOTARIZATION_ID}`);
			expect(options.method).toBe(HttpMethod.DELETE);
		});

		test("resolves without a return value", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			const result = await client.remove(NOTARIZATION_ID);

			expect(result).toBeUndefined();
		});
	});

	describe("update", () => {
		test("throws when notarization is undefined", async () => {
			await expect(client.update(undefined as never)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.objectUndefined"
			});
		});

		test("sends PUT to /{prefix}/:id", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.update(TEST_NOTARIZATION);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${NOTARIZATION_ID}`);
			expect(options.method).toBe(HttpMethod.PUT);
		});

		test("sends notarization fields in the request body", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.update(TEST_NOTARIZATION);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.id).toBe(NOTARIZATION_ID);
			expect(body.mode).toBe(NotarizationMode.Dynamic);
		});

		test("converts data bytes to base64 in the request body", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.update(TEST_NOTARIZATION);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.data).toBe(TEST_DATA_BASE64);
		});

		test("resolves without a return value", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			const result = await client.update(TEST_NOTARIZATION);

			expect(result).toBeUndefined();
		});
	});

	describe("transfer", () => {
		test("throws when id is empty", async () => {
			await expect(client.transfer("", RECIPIENT_ADDRESS)).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("throws when recipientAddress is empty", async () => {
			await expect(client.transfer(NOTARIZATION_ID, "")).rejects.toMatchObject({
				name: GuardError.CLASS_NAME,
				message: "guard.stringEmpty"
			});
		});

		test("sends POST to /{prefix}/:id/transfer", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.transfer(NOTARIZATION_ID, RECIPIENT_ADDRESS);

			const [url, options] = fetchMock.mock.calls[0];
			expect(url).toBe(`${ENDPOINT}/${PREFIX}/${NOTARIZATION_ID}/transfer`);
			expect(options.method).toBe(HttpMethod.POST);
		});

		test("sends recipientAddress in the request body", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			await client.transfer(NOTARIZATION_ID, RECIPIENT_ADDRESS);

			const [, options] = fetchMock.mock.calls[0];
			const body = JSON.parse(options.body);
			expect(body.recipientAddress).toBe(RECIPIENT_ADDRESS);
		});

		test("resolves without a return value", async () => {
			fetchMock.mockResolvedValueOnce(noContentResponse());

			const result = await client.transfer(NOTARIZATION_ID, RECIPIENT_ADDRESS);

			expect(result).toBeUndefined();
		});
	});
});
