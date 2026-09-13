import type { components } from './schema.ts';

type S = components['schemas'];

export type CurrentUser = S['CurrentUserDto'];
export type Balance = S['CreditBalanceDto'];
export type Pack = S['CreditPackDto'];
export type AdminPack = S['AdminPackDto'];
export type Order = S['CreditOrderDto'];
export type OwnerOrder = S['OwnerOrderDto'];
export type OwnerUser = S['OwnerUserDto'];
export type OwnerGeneration = S['OwnerGenerationDto'];
export type SpendDay = S['OwnerSpendDayDto'];
export type PaymentInstructions = S['PaymentInstructionsDto'];
export type SupportContacts = S['SupportContactsDto'];
export type PublicSettings = S['PublicSettingsDto'];
export type HeroOverride = S['HeroPhotosDto']['photos'][number];

export type BriefDto = S['BriefDto'];
export type ProjectSummary = S['ProjectSummaryDto'];
export type ProjectDetail = S['ProjectDetailDto'];
export type StoredAsset = S['StoredAssetDto'];

export type GalleryCard = S['GalleryListDto']['examples'][number];
export type GalleryExample = S['GalleryExampleDto'];
export type GalleryCategory = GalleryCard['category'];
export type OwnerExample = S['OwnerGalleryExampleDto'];
export type ExampleInput = S['GalleryExampleInputDtoClass'];
export type GalleryMedia = S['GalleryMediaDto'];

export type AcceptedGeneration = S['AcceptedGenerationDto'];
export type GenerationDetail = S['GenerationDetailDto'];
export type JobStatus = GenerationDetail['status'];
export type AdPackage = NonNullable<GenerationDetail['package']>;
export type Shot = AdPackage['result']['shots'][number];

export type Goal = BriefDto['goal'];
export type FormatId = BriefDto['formatId'];
export type Platform = BriefDto['platform'];
export type AspectRatio = BriefDto['aspectRatio'];
export type PaymentMethod = Order['paymentMethod'];
export type OrderStatus = Order['status'];
