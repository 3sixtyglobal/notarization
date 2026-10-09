// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Factory } from "@3sixty/core";
import type { INotarizationConnector } from "../models/INotarizationConnector.js";

/**
 * Factory for creating notarization connectors.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const NotarizationConnectorFactory =
	Factory.createFactory<INotarizationConnector>("notarization-connector");
