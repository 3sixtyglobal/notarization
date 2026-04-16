// Copyright 2026 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRestRouteEntryPoint } from "@twin.org/api-models";
import { generateRestRoutesNotarization, tagsNotarization } from "./notarizationRoutes.js";

export const restEntryPoints: IRestRouteEntryPoint[] = [
	{
		name: "notarization",
		defaultBaseRoute: "notarization",
		tags: tagsNotarization,
		generateRoutes: generateRestRoutesNotarization
	}
];
