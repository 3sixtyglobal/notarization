// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaFactory, EntitySchemaHelper } from "@3sixty/entity";
import { nameof } from "@3sixty/nameof";
import { Notarization } from "./entities/notarization.js";

/**
 * Initialize the schema for the notarization entity storage connector.
 */
export function initSchema(): void {
	EntitySchemaFactory.register(nameof<Notarization>(), () =>
		EntitySchemaHelper.getSchema(Notarization)
	);
}
