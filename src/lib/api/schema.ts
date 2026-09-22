/**
 * GENERATED from jas-ad-studio-api/openapi.json (42 paths). Do not edit.
 * Regenerate with `pnpm api:generate`.
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
    "/api/credits/balance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** The caller's credit balance. A new account is at zero (D-010). */
        get: operations["CreditsController_balance"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/gallery": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Published example ads. Works signed out.
         * @description Cards only — the English prompt is not included, because §15 requires this page to stay fast on mobile. Fetch one example for its prompt.
         */
        get: operations["GalleryController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/gallery/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * One published example, with its English prompt. Works signed out.
         * @description An unpublished slug is a 404, never a 403 — a 403 confirms it exists. A PRO example IS a 403 (PROMPT_LOCKED): its badge already says it exists.
         */
        get: operations["GalleryController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/gallery/media/{path}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** An example clip or poster. Public, immutable, supports Range. */
        get: operations["GalleryController_serveMedia"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/generations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** One generation's status, and its package once it is ready. 404 if not yours. */
        get: operations["GenerationController_read"];
        put?: never;
        post?: never;
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
    "/api/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** The caller's own orders, newest first. */
        get: operations["CreditsController_list"];
        put?: never;
        /** Place an order for a pack. It stays pending until the owner confirms (D-008). */
        post: operations["CreditsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/orders/{id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancel your own pending order. 404 if it is not yours. */
        post: operations["CreditsController_cancel"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/gallery": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Every gallery example, published or not. */
        get: operations["OwnerController_listGallery"];
        put?: never;
        /** Create a gallery example. Never published unless asked. */
        post: operations["OwnerController_createGalleryExample"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/gallery/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete a gallery example. The media file is left in place. */
        delete: operations["OwnerController_deleteGalleryExample"];
        options?: never;
        head?: never;
        /** Edit a gallery example, including whether it is published. */
        patch: operations["OwnerController_editGalleryExample"];
        trace?: never;
    };
    "/api/owner/gallery/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload a gallery clip or poster. */
        post: operations["OwnerController_uploadGalleryMedia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/generations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Recent generations across all sellers, newest first. Read-only. */
        get: operations["OwnerController_listGenerations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/grants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Grant credits by hand. The note is required (A3). */
        post: operations["OwnerController_grant"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** The order queue, oldest first. Filter with ?status=pending. */
        get: operations["OwnerController_listOrders"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/orders/{id}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirm a payment. Idempotent: a second confirm credits nothing (A8). */
        post: operations["OwnerController_confirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/orders/{id}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reject a payment with a reason the seller is shown. */
        post: operations["OwnerController_reject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/packs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Edit a pack. Activating one requires stating its price in the same request. */
        patch: operations["OwnerController_setPack"];
        trace?: never;
    };
    "/api/owner/pro": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Give a seller PRO access until a date. The note is required. */
        post: operations["OwnerController_grantPro"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/pro/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** PRO orders, newest first. Filter with ?status=pending. */
        get: operations["OwnerController_listProOrders"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/pro/orders/{id}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirm a PRO payment. Extends the seller's access. */
        post: operations["OwnerController_confirmProOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/pro/orders/{id}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reject a PRO order. The reason is required. */
        post: operations["OwnerController_rejectProOrder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/settings/hero-photos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Set the hero tray photos, in display order. */
        patch: operations["OwnerController_setHeroPhotos"];
        trace?: never;
    };
    "/api/owner/settings/payment-instructions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Set the card number, Payme/Click links and Uzbek instructions. */
        patch: operations["OwnerController_setPaymentInstructions"];
        trace?: never;
    };
    "/api/owner/settings/pro-subscription": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Set the PRO price in soʻm and its length in days. */
        patch: operations["OwnerController_setProSubscription"];
        trace?: never;
    };
    "/api/owner/settings/support-contacts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Set the Telegram account, Telegram bot and support email. */
        patch: operations["OwnerController_setSupportContacts"];
        trace?: never;
    };
    "/api/owner/spend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Daily AI spend in USD for the last 30 days. Read-only. */
        get: operations["OwnerController_listSpend"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/owner/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Users with their credit balances. Read-only. */
        get: operations["OwnerController_listUsers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/packs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Packs for sale. Empty until the owner prices and activates one (A8). */
        get: operations["CreditsController_listPacks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pro/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Whether this caller may open PRO prompts. Works signed out. */
        get: operations["ProController_status"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pro/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** This seller's own PRO orders, newest first. */
        get: operations["ProController_listMyOrders"];
        put?: never;
        /** Ask to buy PRO. The owner confirms the payment by hand. */
        post: operations["ProController_placeOrder"];
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
        /** One project and the brief it was saved from. 404 if it is not the caller's, never 403. */
        get: operations["ProjectsController_get"];
        put?: never;
        post?: never;
        /** Delete: the brief, photos and generated packages are removed (D-021). Generation and ledger rows stay. */
        delete: operations["ProjectsController_remove"];
        options?: never;
        head?: never;
        /** Replace the brief. Every field is required. */
        patch: operations["ProjectsController_update"];
        trace?: never;
    };
    "/api/projects/{id}/generations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** A project's generations, newest first, with packages where ready. 404 if not yours. */
        get: operations["GenerationController_list"];
        put?: never;
        /** Queue one ad package. Costs one credit on success; a failure gives it back. The same Idempotency-Key returns the same job and never charges twice. */
        post: operations["GenerationController_request"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
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
    "/api/settings/public": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Payment instructions and support contacts. Works signed out. */
        get: operations["SettingsController_getPublic"];
        put?: never;
        post?: never;
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
        AcceptedGenerationDto: {
            fromCache: boolean;
            /** Format: uuid */
            generationId: string;
            questionsUz: string[];
            /** @enum {string} */
            status: "queued" | "running" | "ready" | "needs_input" | "refused" | "failed";
        };
        AdminPackDto: {
            credits: number;
            id: string;
            isActive: boolean;
            priceUzs: number | null;
            sortOrder: number;
        };
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
        CreateOrderDto: {
            packId: string;
            payerReference?: string | null;
            /** @enum {string} */
            paymentMethod: "card_transfer" | "payme" | "click" | "other";
        };
        CreditBalanceDto: {
            available: number;
            reserved: number;
        };
        CreditOrderDto: {
            amountUzs: number;
            /** Format: date-time */
            confirmedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            credits: number;
            /** Format: uuid */
            id: string;
            packId: string;
            payerReference: string | null;
            /** @enum {string} */
            paymentMethod: "card_transfer" | "payme" | "click" | "other";
            rejectionReason: string | null;
            /** @enum {string} */
            status: "pending" | "paid" | "rejected" | "cancelled";
        };
        CreditOrderSummaryDto: {
            amountUzs: number;
            /** Format: date-time */
            confirmedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            credits: number;
            /** Format: uuid */
            id: string;
            packId: string;
            payerReference: string | null;
            /** @enum {string} */
            paymentMethod: "card_transfer" | "payme" | "click" | "other";
            rejectionReason: string | null;
            /** @enum {string} */
            status: "pending" | "paid" | "rejected" | "cancelled";
        };
        CreditPackDto: {
            credits: number;
            id: string;
            priceUzs: number;
            sortOrder: number;
        };
        CurrentUserDto: {
            /** Format: email */
            email: string;
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            role: "seller" | "owner";
        };
        GalleryExampleDto: {
            /** @enum {string} */
            aspectRatio: "9:16" | "16:9" | "1:1";
            /** @enum {string} */
            category: "kiyim" | "poyabzal" | "parfyum" | "kosmetika" | "uy-rozgor" | "elektronika" | "oziq-ovqat" | "aksessuar";
            conceptUz: string;
            durationSeconds: number;
            id: string;
            posterUrl: string;
            /** @enum {string} */
            promptAccess: "free" | "pro";
            promptEn: string;
            referencePhotoUrl: string | null;
            slug: string;
            sourceNote: string;
            /** @enum {string} */
            sourceType: "app-prompt" | "studio-made" | "external";
            style: string;
            titleUz: string;
            videoUrl: string;
        };
        GalleryExampleInputDtoClass: {
            /** @enum {string} */
            aspectRatio: "9:16" | "16:9" | "1:1";
            /** @enum {string} */
            category: "kiyim" | "poyabzal" | "parfyum" | "kosmetika" | "uy-rozgor" | "elektronika" | "oziq-ovqat" | "aksessuar";
            conceptUz: string;
            creativePreset: {
                cameraLanguage: string;
                environment: string;
                lighting: string;
                mood: string;
                pacing: string;
            };
            durationSeconds: number;
            flowMode: string | null;
            flowModel: string | null;
            isPublished: boolean;
            posterPath: string;
            /**
             * @default free
             * @enum {string}
             */
            promptAccess: "free" | "pro";
            promptEn: string;
            /** @default null */
            referencePhotoPath: string | null;
            slug: string;
            sortOrder: number;
            sourceNote: string;
            /** @enum {string} */
            sourceType: "app-prompt" | "studio-made" | "external";
            style: string;
            titleUz: string;
            videoPath: string;
        };
        GalleryListDto: {
            examples: {
                /** @enum {string} */
                aspectRatio: "9:16" | "16:9" | "1:1";
                /** @enum {string} */
                category: "kiyim" | "poyabzal" | "parfyum" | "kosmetika" | "uy-rozgor" | "elektronika" | "oziq-ovqat" | "aksessuar";
                conceptUz: string;
                durationSeconds: number;
                id: string;
                posterUrl: string;
                /** @enum {string} */
                promptAccess: "free" | "pro";
                referencePhotoUrl: string | null;
                slug: string;
                sourceNote: string;
                /** @enum {string} */
                sourceType: "app-prompt" | "studio-made" | "external";
                style: string;
                titleUz: string;
                videoUrl: string;
            }[];
        };
        GalleryMediaDto: {
            contentType: string;
            path: string;
        };
        GenerationDetailDto: {
            /** Format: date-time */
            createdAt: string;
            errorCode: string | null;
            /** Format: date-time */
            finishedAt: string | null;
            /** Format: uuid */
            id: string;
            messageUz: string | null;
            package: {
                /** Format: date-time */
                createdAt: string;
                /** Format: uuid */
                generationId: string;
                promptEn: string;
                result: {
                    assumptionsUz: string[];
                    concept: {
                        ctaUz: string;
                        /** @enum {string} */
                        formatId: "product-film" | "high-energy" | "lifestyle-story" | "ugc-authentic";
                        hookUz: string;
                        rationaleUz: string;
                        titleUz: string;
                    } | null;
                    messageUz: string | null;
                    product: {
                        category: string;
                        confirmedClaims: string[];
                        fidelityConstraints: string[];
                        observedDetails: string[];
                        referenceConflicts: string[];
                        unknownDetails: string[];
                    };
                    promptEn: string | null;
                    questionsUz: string[];
                    reviewNotesUz: string[];
                    shots: {
                        cameraUz: string;
                        descriptionUz: string;
                        endSeconds: number;
                        startSeconds: number;
                    }[];
                    /** @enum {string} */
                    status: "ready" | "needs_input" | "refused";
                    target: {
                        /** @enum {string} */
                        aspectRatio: "9:16" | "16:9" | "1:1";
                        durationSeconds: number;
                        targetId: string;
                    } | null;
                };
            } | null;
            /** Format: uuid */
            projectId: string;
            questionsUz: string[];
            /** @enum {string} */
            status: "queued" | "running" | "ready" | "needs_input" | "refused" | "failed";
        };
        GrantDto: {
            credits: number;
            note: string;
            /** Format: uuid */
            userId: string;
        };
        HeroPhotosDto: {
            /** @default [] */
            photos: {
                altUz: string;
                path: string;
                slot: number;
            }[];
        };
        OwnerGalleryExampleDto: {
            /** @enum {string} */
            aspectRatio: "9:16" | "16:9" | "1:1";
            /** @enum {string} */
            category: "kiyim" | "poyabzal" | "parfyum" | "kosmetika" | "uy-rozgor" | "elektronika" | "oziq-ovqat" | "aksessuar";
            conceptUz: string;
            creativePreset: {
                cameraLanguage: string;
                environment: string;
                lighting: string;
                mood: string;
                pacing: string;
            };
            durationSeconds: number;
            flowMode: string | null;
            flowModel: string | null;
            id: string;
            isPublished: boolean;
            posterPath: string;
            /**
             * @default free
             * @enum {string}
             */
            promptAccess: "free" | "pro";
            promptEn: string;
            /** @default null */
            referencePhotoPath: string | null;
            slug: string;
            sortOrder: number;
            sourceNote: string;
            /** @enum {string} */
            sourceType: "app-prompt" | "studio-made" | "external";
            style: string;
            titleUz: string;
            videoPath: string;
        };
        OwnerGalleryListDto: {
            examples: {
                /** @enum {string} */
                aspectRatio: "9:16" | "16:9" | "1:1";
                /** @enum {string} */
                category: "kiyim" | "poyabzal" | "parfyum" | "kosmetika" | "uy-rozgor" | "elektronika" | "oziq-ovqat" | "aksessuar";
                conceptUz: string;
                creativePreset: {
                    cameraLanguage: string;
                    environment: string;
                    lighting: string;
                    mood: string;
                    pacing: string;
                };
                durationSeconds: number;
                flowMode: string | null;
                flowModel: string | null;
                id: string;
                isPublished: boolean;
                posterPath: string;
                /**
                 * @default free
                 * @enum {string}
                 */
                promptAccess: "free" | "pro";
                promptEn: string;
                /** @default null */
                referencePhotoPath: string | null;
                slug: string;
                sortOrder: number;
                sourceNote: string;
                /** @enum {string} */
                sourceType: "app-prompt" | "studio-made" | "external";
                style: string;
                titleUz: string;
                videoPath: string;
            }[];
        };
        OwnerGenerationDto: {
            /** Format: date-time */
            createdAt: string;
            estCostUsd: number | null;
            /** Format: date-time */
            finishedAt: string | null;
            /** Format: uuid */
            id: string;
            model: string | null;
            projectName: string | null;
            status: string;
            /** Format: email */
            userEmail: string;
        };
        OwnerOrderDto: {
            amountUzs: number;
            /** Format: date-time */
            confirmedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            credits: number;
            /** Format: uuid */
            id: string;
            packId: string;
            payerReference: string | null;
            /** @enum {string} */
            paymentMethod: "card_transfer" | "payme" | "click" | "other";
            rejectionReason: string | null;
            /** @enum {string} */
            status: "pending" | "paid" | "rejected" | "cancelled";
            /** Format: email */
            userEmail: string;
            /** Format: uuid */
            userId: string;
        };
        OwnerProOrderDto: {
            amountUzs: number;
            /** Format: date-time */
            confirmedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            days: number;
            /** Format: email */
            email: string;
            generations: number;
            /** Format: uuid */
            id: string;
            rejectionReason: string | null;
            /** @enum {string} */
            status: "pending" | "confirmed" | "rejected";
            /** Format: uuid */
            userId: string;
        };
        OwnerSpendDayDto: {
            day: string;
            estCostUsd: number;
            failed: number;
            generations: number;
        };
        OwnerUserDto: {
            available: number;
            /** Format: date-time */
            createdAt: string;
            /** Format: email */
            email: string;
            /** Format: uuid */
            id: string;
            reserved: number;
            role: string;
        };
        PackEditDto: {
            isActive?: boolean;
            priceUzs?: number;
            sortOrder?: number;
        };
        PaymentInstructionsDto: {
            /** @default null */
            cardHolder: string | null;
            /** @default null */
            cardNumber: string | null;
            /**
             * Format: uri
             * @default null
             */
            clickUrl: string | null;
            /** @default null */
            instructionsUz: string | null;
            /**
             * Format: uri
             * @default null
             */
            paymeUrl: string | null;
        };
        ProGrantDto: {
            note: string;
            /** Format: date-time */
            until: string;
            /** Format: uuid */
            userId: string;
        };
        ProjectDetailDto: {
            aspectRatio: string;
            brief: {
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
            /** Format: date-time */
            createdAt: string;
            durationSeconds: number;
            formatId: string;
            /** Format: uuid */
            id: string;
            name: string;
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
        ProOrderDto: {
            amountUzs: number;
            /** Format: date-time */
            confirmedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            days: number;
            generations: number;
            /** Format: uuid */
            id: string;
            rejectionReason: string | null;
            /** @enum {string} */
            status: "pending" | "confirmed" | "rejected";
        };
        ProStatusDto: {
            hasPro: boolean;
            /** Format: date-time */
            until: string | null;
        };
        ProSubscriptionDto: {
            /** @default 30 */
            days: number;
            /** @default 0 */
            generationsIncluded: number;
            /** @default null */
            priceUzs: number | null;
        };
        PublicSettingsDto: {
            heroPhotos: {
                /** @default [] */
                photos: {
                    altUz: string;
                    path: string;
                    slot: number;
                }[];
            };
            paymentInstructions: {
                /** @default null */
                cardHolder: string | null;
                /** @default null */
                cardNumber: string | null;
                /**
                 * Format: uri
                 * @default null
                 */
                clickUrl: string | null;
                /** @default null */
                instructionsUz: string | null;
                /**
                 * Format: uri
                 * @default null
                 */
                paymeUrl: string | null;
            };
            proSubscription: {
                /** @default 30 */
                days: number;
                /** @default 0 */
                generationsIncluded: number;
                /** @default null */
                priceUzs: number | null;
            };
            supportContacts: {
                /**
                 * Format: email
                 * @default null
                 */
                email: string | null;
                /** @default null */
                telegramBot: string | null;
                /** @default null */
                telegramUser: string | null;
            };
        };
        RejectOrderDto: {
            reason: string;
        };
        RejectProOrderDto: {
            reason: string;
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
        SupportContactsDto: {
            /**
             * Format: email
             * @default null
             */
            email: string | null;
            /** @default null */
            telegramBot: string | null;
            /** @default null */
            telegramUser: string | null;
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
    CreditsController_balance: {
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
                    "application/json": components["schemas"]["CreditBalanceDto"];
                };
            };
        };
    };
    GalleryController_list: {
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
                    "application/json": components["schemas"]["GalleryListDto"];
                };
            };
        };
    };
    GalleryController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
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
                    "application/json": components["schemas"]["GalleryExampleDto"];
                };
            };
            /** @description The prompt is PRO and this caller has no access. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GalleryController_serveMedia: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Media path, e.g. 9f1c….mp4 */
                path: unknown;
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
                    "video/mp4": string;
                };
            };
            /** @description A byte range, for seeking in a clip. */
            206: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GenerationController_read: {
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
                    "application/json": components["schemas"]["GenerationDetailDto"];
                };
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
    CreditsController_list: {
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
                    "application/json": components["schemas"]["CreditOrderDto"][];
                };
            };
        };
    };
    CreditsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateOrderDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreditOrderDto"];
                };
            };
        };
    };
    CreditsController_cancel: {
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
                    "application/json": components["schemas"]["CreditOrderDto"];
                };
            };
        };
    };
    OwnerController_listGallery: {
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
                    "application/json": components["schemas"]["OwnerGalleryListDto"];
                };
            };
        };
    };
    OwnerController_createGalleryExample: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GalleryExampleInputDtoClass"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnerGalleryExampleDto"];
                };
            };
        };
    };
    OwnerController_deleteGalleryExample: {
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
    OwnerController_editGalleryExample: {
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
                "application/json": components["schemas"]["GalleryExampleInputDtoClass"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnerGalleryExampleDto"];
                };
            };
        };
    };
    OwnerController_uploadGalleryMedia: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GalleryMediaDto"];
                };
            };
        };
    };
    OwnerController_listGenerations: {
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
                    "application/json": components["schemas"]["OwnerGenerationDto"][];
                };
            };
        };
    };
    OwnerController_grant: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GrantDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreditBalanceDto"];
                };
            };
        };
    };
    OwnerController_listOrders: {
        parameters: {
            query: {
                status: string;
            };
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
                    "application/json": components["schemas"]["OwnerOrderDto"][];
                };
            };
        };
    };
    OwnerController_confirm: {
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
                    "application/json": components["schemas"]["CreditOrderSummaryDto"];
                };
            };
        };
    };
    OwnerController_reject: {
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
                "application/json": components["schemas"]["RejectOrderDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreditOrderSummaryDto"];
                };
            };
        };
    };
    OwnerController_setPack: {
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
                "application/json": components["schemas"]["PackEditDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AdminPackDto"];
                };
            };
        };
    };
    OwnerController_grantPro: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProGrantDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProStatusDto"];
                };
            };
        };
    };
    OwnerController_listProOrders: {
        parameters: {
            query: {
                status: string;
            };
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
                    "application/json": components["schemas"]["OwnerProOrderDto"][];
                };
            };
        };
    };
    OwnerController_confirmProOrder: {
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
                    "application/json": components["schemas"]["ProStatusDto"];
                };
            };
        };
    };
    OwnerController_rejectProOrder: {
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
                "application/json": components["schemas"]["RejectProOrderDto"];
            };
        };
        responses: {
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    OwnerController_setHeroPhotos: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HeroPhotosDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HeroPhotosDto"];
                };
            };
        };
    };
    OwnerController_setPaymentInstructions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PaymentInstructionsDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentInstructionsDto"];
                };
            };
        };
    };
    OwnerController_setProSubscription: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProSubscriptionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProSubscriptionDto"];
                };
            };
        };
    };
    OwnerController_setSupportContacts: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SupportContactsDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SupportContactsDto"];
                };
            };
        };
    };
    OwnerController_listSpend: {
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
                    "application/json": components["schemas"]["OwnerSpendDayDto"][];
                };
            };
        };
    };
    OwnerController_listUsers: {
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
                    "application/json": components["schemas"]["OwnerUserDto"][];
                };
            };
        };
    };
    CreditsController_listPacks: {
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
                    "application/json": components["schemas"]["CreditPackDto"][];
                };
            };
        };
    };
    ProController_status: {
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
                    "application/json": components["schemas"]["ProStatusDto"];
                };
            };
        };
    };
    ProController_listMyOrders: {
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
                    "application/json": components["schemas"]["ProOrderDto"][];
                };
            };
        };
    };
    ProController_placeOrder: {
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
                    "application/json": components["schemas"]["ProOrderDto"];
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
                    "application/json": components["schemas"]["ProjectDetailDto"];
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
    GenerationController_list: {
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
                    "application/json": components["schemas"]["GenerationDetailDto"][];
                };
            };
        };
    };
    GenerationController_request: {
        parameters: {
            query?: never;
            header: {
                "idempotency-key": string;
                /** @description Per attempt, reused on retry. This is the double-click guard (§32). */
                "Idempotency-Key": string;
            };
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AcceptedGenerationDto"];
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
    SettingsController_getPublic: {
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
                    "application/json": components["schemas"]["PublicSettingsDto"];
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
