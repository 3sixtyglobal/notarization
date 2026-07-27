// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { NotarizationClient } from "@iota/notarization/node/index.js";

/**
 * Structural view of the vendor transaction builder used to post notarization transactions.
 */
export interface INotarizationTransactionBuilder {
	/**
	 * The transaction operation held by the builder.
	 */
	readonly transaction: {
		/**
		 * Build the gas-free programmable transaction bytes for the operation.
		 * @param client The notarization client to build with.
		 * @returns The BCS serialization of the programmable transaction.
		 */
		buildProgrammableTransaction(client: NotarizationClient): Promise<Uint8Array>;
	};

	/**
	 * Build the full transaction bytes and signatures for direct posting.
	 * @param client The notarization client to build with.
	 * @returns The transaction bytes, signatures and operation.
	 */
	build(client: NotarizationClient): Promise<[Uint8Array, string[], unknown]>;
}
