import { access } from "node:fs/promises";
import { resolve } from "node:path";

import { getCollection, type CollectionEntry } from "astro:content";

type LandingSettingsEntry = CollectionEntry<"landingSettings">;
type LandingSectionEntry = CollectionEntry<"landingSections">;
type LandingSectionData = LandingSectionEntry["data"];
type LandingSectionId = LandingSectionData["section"];
type SectionById<T extends LandingSectionId> = Extract<
  LandingSectionData,
  { section: T }
>;
type LandingSeo = LandingSettingsEntry["data"]["seo"];
type LandingIntegrations = LandingSettingsEntry["data"]["integrations"];

type LandingContent = {
  seo: LandingSeo;
  integrations?: LandingIntegrations;
  hero: Omit<Extract<LandingSectionData, { section: "hero" }>, "section">;
  features: Omit<
    Extract<LandingSectionData, { section: "features" }>,
    "section"
  >;
  worksFeatures: Omit<
    Extract<LandingSectionData, { section: "works-features" }>,
    "section"
  >;
  useCases: Omit<
    Extract<LandingSectionData, { section: "use-cases" }>,
    "section"
  >;
  testimonials: Omit<
    Extract<LandingSectionData, { section: "testimonials" }>,
    "section"
  >;
  pricing: Omit<Extract<LandingSectionData, { section: "pricing" }>, "section">;
  faq: Omit<Extract<LandingSectionData, { section: "faq" }>, "section">;
  cta: Omit<Extract<LandingSectionData, { section: "cta" }>, "section">;
  footer: Omit<Extract<LandingSectionData, { section: "footer" }>, "section">;
};

const REQUIRED_SECTION_IDS: LandingSectionId[] = [
  "hero",
  "features",
  "works-features",
  "use-cases",
  "testimonials",
  "pricing",
  "faq",
  "cta",
  "footer",
];

const SECTION_FILENAME_PATTERN = /^(\d{3})-([a-z0-9-]+)\.md$/;

function normalizeContentEntryId(entryId: string) {
  return entryId.endsWith(".md") ? entryId.slice(0, -3) : entryId;
}

function getSingleLandingSettingsEntry(
  entries: LandingSettingsEntry[],
): LandingSettingsEntry {
  if (entries.length === 0) {
    throw new Error(
      "Missing landing settings entry at src/content/landing-settings/index.md",
    );
  }

  if (entries.length > 1) {
    throw new Error(
      `Expected exactly one landing settings entry, found ${entries.length} in src/content/landing-settings`,
    );
  }

  const [entry] = entries;
  const normalizedEntryId = normalizeContentEntryId(entry.id);

  if (normalizedEntryId !== "index") {
    throw new Error(
      `Landing settings file must be src/content/landing-settings/index.md, received ${entry.id}`,
    );
  }

  return entry;
}

function parseSectionFilename(entryId: string) {
  const normalizedEntryId = normalizeContentEntryId(entryId);
  const match = `${normalizedEntryId}.md`.match(SECTION_FILENAME_PATTERN);

  if (!match) {
    throw new Error(
      `Invalid landing section filename "${entryId}". Expected a three-digit prefix like 010-hero.md`,
    );
  }

  return {
    sequence: Number(match[1]),
    slug: match[2],
  };
}

function getRequiredSection<T extends LandingSectionId>(
  sectionMap: Map<LandingSectionId, LandingSectionData>,
  id: T,
): SectionById<T> {
  const section = sectionMap.get(id);

  if (!section) {
    throw new Error(`Missing required landing section "${id}"`);
  }

  return section as SectionById<T>;
}

function omitSectionId<T extends LandingSectionId>(
  section: SectionById<T>,
): Omit<SectionById<T>, "section"> {
  const sectionWithoutId = {
    ...section,
  } as Omit<SectionById<T>, "section"> & { section?: T };

  delete sectionWithoutId.section;

  return sectionWithoutId;
}

async function assertPublicImageExists(
  sourceFile: string,
  imagePath: string,
  field: string,
) {
  if (!imagePath.startsWith("/")) {
    throw new Error(
      `Landing image path "${imagePath}" in ${sourceFile} (${field}) must be root-relative, for example /images/example.webp`,
    );
  }

  const assetPath = resolve(process.cwd(), "public", imagePath.slice(1));

  try {
    await access(assetPath);
  } catch {
    throw new Error(
      `Landing image path "${imagePath}" in ${sourceFile} (${field}) does not exist at ${assetPath}`,
    );
  }
}

async function validateLandingSectionImages(sections: LandingSectionEntry[]) {
  for (const section of sections) {
    if (section.data.section === "use-cases") {
      for (const [index, tab] of section.data.tabs.entries()) {
        await assertPublicImageExists(
          section.id,
          tab.image,
          `tabs[${index}].image`,
        );
      }
    }

    if (section.data.section === "testimonials") {
      for (const [index, item] of section.data.items.entries()) {
        await assertPublicImageExists(
          section.id,
          item.avatar,
          `items[${index}].avatar`,
        );
        await assertPublicImageExists(
          section.id,
          item.companyLogo,
          `items[${index}].companyLogo`,
        );

        if (item.companyLogoDark) {
          await assertPublicImageExists(
            section.id,
            item.companyLogoDark,
            `items[${index}].companyLogoDark`,
          );
        }
      }
    }
  }
}

export async function loadLandingContent(): Promise<LandingContent> {
  const [landingSettingsEntries, landingSectionEntries] = await Promise.all([
    getCollection("landingSettings"),
    getCollection("landingSections"),
  ]);

  const settingsEntry = getSingleLandingSettingsEntry(landingSettingsEntries);
  const seenSequences = new Map<number, string>();
  const seenSectionSources = new Map<LandingSectionId, string>();
  const sectionMap = new Map<LandingSectionId, LandingSectionData>();

  const sortedSections = [...landingSectionEntries].sort((left, right) => {
    const leftParsed = parseSectionFilename(left.id);
    const rightParsed = parseSectionFilename(right.id);

    return leftParsed.sequence - rightParsed.sequence;
  });

  for (const entry of sortedSections) {
    const { sequence, slug } = parseSectionFilename(entry.id);

    if (seenSequences.has(sequence)) {
      throw new Error(
        `Duplicate landing section sequence ${sequence} found in ${seenSequences.get(sequence)} and ${entry.id}`,
      );
    }

    seenSequences.set(sequence, entry.id);

    if (slug !== entry.data.section) {
      throw new Error(
        `Landing section filename "${entry.id}" must match frontmatter section "${entry.data.section}"`,
      );
    }

    if (sectionMap.has(entry.data.section)) {
      const existingEntry = seenSectionSources.get(entry.data.section);

      throw new Error(
        `Duplicate landing section "${entry.data.section}" found in ${existingEntry ?? "an earlier file"} and ${entry.id}`,
      );
    }

    sectionMap.set(entry.data.section, entry.data);
    seenSectionSources.set(entry.data.section, entry.id);
  }

  for (const requiredSectionId of REQUIRED_SECTION_IDS) {
    if (!sectionMap.has(requiredSectionId)) {
      throw new Error(
        `Missing required landing section file for "${requiredSectionId}" in src/content/landing-sections`,
      );
    }
  }

  await validateLandingSectionImages(sortedSections);

  const hero = omitSectionId(getRequiredSection(sectionMap, "hero"));
  const features = omitSectionId(getRequiredSection(sectionMap, "features"));

  const worksFeatures = omitSectionId(
    getRequiredSection(sectionMap, "works-features"),
  );

  const useCases = omitSectionId(getRequiredSection(sectionMap, "use-cases"));

  const testimonials = omitSectionId(
    getRequiredSection(sectionMap, "testimonials"),
  );

  const pricing = omitSectionId(getRequiredSection(sectionMap, "pricing"));

  const faq = omitSectionId(getRequiredSection(sectionMap, "faq"));
  const cta = omitSectionId(getRequiredSection(sectionMap, "cta"));
  const footer = omitSectionId(getRequiredSection(sectionMap, "footer"));

  return {
    seo: settingsEntry.data.seo,
    integrations: settingsEntry.data.integrations,
    hero,
    features,
    worksFeatures,
    useCases,
    testimonials,
    pricing,
    faq,
    cta,
    footer,
  };
}
