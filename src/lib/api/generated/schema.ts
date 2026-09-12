/**
 * GENERATED FILE. DO NOT EDIT BY HAND (D-031).
 *
 * Source: jas-ad-studio-api openapi.json @ main (28cd5b6)
 * Paths:  11
 *
 * Regenerate with `pnpm api:generate`. `pnpm api:check` fails if this drifted.
 */
export interface paths {
    "/api/assets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete a photo. Both stored copies go, and the files with them. */
        delete: operations["AssetsController_remove"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/assets/{id}/reference": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download the 2048px reference copy.
         * @description Private: never cached, and 404 once the project is deleted (D-068).
         */
        get: operations["AssetsController_reference"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/google": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Start Google sign-in. Open this in a browser, not from this page.
         * @description Redirects to Google. It cannot be driven from Swagger — the consent screen needs a real browser navigation. Once signed in, the session cookie is set on this origin and every route below works from here.
         */
        get: operations["AuthController_start"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/google/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Google's redirect target. Not called directly.
         * @description A missing or stale state is 400 OAUTH_STATE_INVALID; only a genuine provider failure is 502 AUTH_PROVIDER_FAILED (D-067).
         */
        get: operations["AuthController_callback"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revoke the session immediately, server-side. */
        post: operations["AuthController_logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** The signed-in user. The role comes from OWNER_EMAILS (D-037). */
        get: operations["AuthController_me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** The caller's own projects, newest first. Deleted ones are omitted. */
        get: operations["ProjectsController_list"];
        put?: never;
        /** Create a project from the seller's brief. */
        post: operations["ProjectsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/projects/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** One project. 404 if it is not the caller's, never 403. */
        get: operations["ProjectsController_get"];
        put?: never;
        post?: never;
        /** Soft-delete. Its photos stop being served too (D-068). */
        delete: operations["ProjectsController_remove"];
        options?: never;
        head?: never;
        /** Replace the brief. Every field is required. */
        patch: operations["ProjectsController_update"];
        trace?: never;
    };
    "/api/projects/{projectId}/assets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** A project's reference photos, oldest first. */
        get: operations["AssetsController_list"];
        put?: never;
        /**
         * Upload one product photo. At most four per project.
         * @description The format is decided by decoding, never by filename or content-type. Two copies are stored — a 2048px reference and a 1024px model input — with all metadata stripped. width and height describe the reference copy (D-066).
         */
        post: operations["AssetsController_upload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Liveness. Always 200 while the process is running. */
        get: operations["HealthController_live"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Readiness. 503 when a dependency is unusable. */
        get: operations["HealthController_ready"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        BriefDto: {
            /** @enum {string} */
            aspectRatio: "9:16" | "16:9" | "1:1";
            audience: string | null;
            confirmedClaims: {
                claim: string;
                verified: boolean;
            }[];
            description: string;
            /** @default 10 */
            durationSeconds: number;
            /** @enum {string} */
            formatId: "product-film" | "high-energy" | "lifestyle-story" | "ugc-authentic";
            galleryInspirationId: string | null;
            /** @enum {string} */
            goal: "awareness" | "sales" | "launch" | "trust";
            offer: {
                description: string;
                priceUzs: number | null;
                /** Format: date */
                validUntil: string | null;
            } | null;
            /** @enum {string} */
            platform: "instagram" | "telegram" | "tiktok" | "youtube-shorts";
            productName: string;
        };
        CurrentUserDto: {
            /** Format: email */
            email: string;
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            role: "seller" | "owner";
        };
        ProjectSummaryDto: {
            aspectRatio: string;
            /** Format: date-time */
            createdAt: string;
            durationSeconds: number;
            formatId: string;
            /** Format: uuid */
            id: string;
            name: string;
        };
        StoredAssetDto: {
            bytes: number;
            height: number;
            /** Format: uuid */
            id: string;
            isPrimary: boolean;
            /** Format: uuid */
            projectId: string;
            width: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    AssetsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AssetsController_reference: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "image/jpeg": string;
                };
            };
        };
    };
    AuthController_start: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_callback: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_me: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CurrentUserDto"];
                };
            };
        };
    };
    ProjectsController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectSummaryDto"][];
                };
            };
        };
    };
    ProjectsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BriefDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectSummaryDto"];
                };
            };
        };
    };
    ProjectsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectSummaryDto"];
                };
            };
        };
    };
    ProjectsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProjectsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BriefDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectSummaryDto"];
                };
            };
        };
    };
    AssetsController_list: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StoredAssetDto"][];
                };
            };
        };
    };
    AssetsController_upload: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                projectId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    photo: string;
                };
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StoredAssetDto"];
                };
            };
        };
    };
    HealthController_live: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The process is alive. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    HealthController_ready: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Every dependency is up. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description At least one dependency is down; the report names which. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
