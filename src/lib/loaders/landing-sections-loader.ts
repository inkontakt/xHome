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
type LandingReviewsProxy = LandingSettingsEntry["data"]["reviewsProxy"];

type LandingContent = {
  seo: LandingSeo;
  integrations?: LandingIntegrations;
  reviewsProxy?: LandingReviewsProxy;
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeMarkdownBody(body: string) {
  return body.replace(/\r\n/g, "\n").trim();
}

function getMarkdownSection(body: string, heading: string) {
  const normalizedBody = normalizeMarkdownBody(body);
  const pattern = new RegExp(
    `^## ${escapeRegExp(heading)}\\n\\n([\\s\\S]*?)(?=^## |\\s*$)`,
    "m",
  );
  const match = normalizedBody.match(pattern);

  return match?.[1]?.trim() ?? null;
}

function getMarkdownSubsection(body: string, heading: string) {
  const normalizedBody = normalizeMarkdownBody(body);
  const pattern = new RegExp(
    `^### ${escapeRegExp(heading)}\\n\\n([\\s\\S]*?)(?=^### |\\s*$)`,
    "m",
  );
  const match = normalizedBody.match(pattern);

  return match?.[1]?.trim() ?? null;
}

function normalizeMarkdownText(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getBulletValue(sectionContent: string, label: string) {
  const match = sectionContent.match(
    new RegExp(`^- ${escapeRegExp(label)}:\\s+` + "`?([^`\\n]+)`?", "m"),
  );

  return match?.[1]?.trim() ?? null;
}

function getLabeledValue(sectionContent: string, label: string) {
  const match = sectionContent.match(
    new RegExp(`^\\*\\*${escapeRegExp(label)}:\\*\\*\\s+(.+)$`, "m"),
  );

  return match?.[1]?.trim() ?? null;
}

function getMarkdownSubsections(sectionContent: string) {
  return sectionContent
    .split(/^###\s+/m)
    .slice(1)
    .map((rawBlock) => {
      const trimmed = rawBlock.trim();
      const [headingLine = "", ...restLines] = trimmed.split("\n");

      return {
        heading: headingLine.trim(),
        body: restLines.join("\n").trim(),
      };
    });
}

function getParagraphs(sectionContent: string) {
  return sectionContent
    .split(/\n\s*\n/)
    .map((paragraph) => normalizeMarkdownText(paragraph))
    .filter(Boolean);
}

function parseHeroBody(
  entry: Extract<LandingSectionEntry, { data: { section: "hero" } }>,
): Omit<Extract<LandingSectionData, { section: "hero" }>, "section"> {
  const headlineSection = getMarkdownSection(entry.body, "Headline");
  const summarySection = getMarkdownSection(entry.body, "Summary");
  const badgeSection = getMarkdownSection(entry.body, "Badge");
  const ctaSection = getMarkdownSection(entry.body, "Calls To Action");
  const socialProofSection = getMarkdownSection(entry.body, "Social Proof");
  const tabsSection = getMarkdownSection(entry.body, "Hero Tabs");

  const lineOne = headlineSection
    ? getLabeledValue(headlineSection, "Line 1")
    : null;
  const lineTwo = headlineSection
    ? getLabeledValue(headlineSection, "Line 2")
    : null;

  const tabs =
    tabsSection
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line, index) => {
        const match = line.match(/^- `([^`]+)` -> (.+)$/);
        const fallbackTab = entry.data.tabs[index];
        const fallbackByValue = match
          ? entry.data.tabs.find((tab) => tab.value === match[1])
          : undefined;
        const tabTemplate = fallbackByValue ?? fallbackTab;

        if (!tabTemplate) {
          return null;
        }

        return {
          value: tabTemplate.value,
          name: match?.[2]?.trim() || tabTemplate.name,
        };
      })
      .filter((tab): tab is NonNullable<typeof tab> => tab !== null) ?? [];

  return {
    ...entry.data,
    title: [lineOne || entry.data.title[0], lineTwo || entry.data.title[1]] as [
      string,
      string,
    ],
    description: summarySection
      ? normalizeMarkdownText(summarySection)
      : entry.data.description,
    badge: {
      label:
        (badgeSection && getBulletValue(badgeSection, "Label")) ||
        entry.data.badge.label,
      text:
        (badgeSection && getBulletValue(badgeSection, "Text")) ||
        entry.data.badge.text,
    },
    primaryCta: {
      label:
        ctaSection?.match(/- Primary:\s+`([^`]+)`/)?.[1] ||
        entry.data.primaryCta.label,
      href:
        ctaSection?.match(/- Primary:\s+`[^`]+`\s+->\s+`([^`]+)`/)?.[1] ||
        entry.data.primaryCta.href,
    },
    secondaryCta: {
      label:
        ctaSection?.match(/- Secondary:\s+`([^`]+)`/)?.[1] ||
        entry.data.secondaryCta.label,
      href:
        ctaSection?.match(/- Secondary:\s+`[^`]+`\s+->\s+`([^`]+)`/)?.[1] ||
        entry.data.secondaryCta.href,
    },
    usersText:
      (socialProofSection &&
        getBulletValue(socialProofSection, "Users text")) ||
      entry.data.usersText,
    ratingText:
      (socialProofSection &&
        getBulletValue(socialProofSection, "Rating text")) ||
      entry.data.ratingText,
    tabs: tabs.length === entry.data.tabs.length ? tabs : entry.data.tabs,
  };
}

function parseFeaturesBody(
  entry: Extract<LandingSectionEntry, { data: { section: "features" } }>,
): Omit<Extract<LandingSectionData, { section: "features" }>, "section"> {
  const cardsSection = getMarkdownSection(entry.body, "Feature Cards");
  const parsedCards =
    cardsSection
      ?.split(/^###\s+/m)
      .slice(1)
      .map((rawCard, index) => {
        const lines = rawCard.trim().split("\n");
        const title =
          lines
            .shift()
            ?.trim()
            .replace(/^\d+\.\s+/, "") ?? "";
        const fallback = entry.data.cards[index];

        return {
          title: title || fallback.title,
          description:
            normalizeMarkdownText(lines.join("\n")) || fallback.description,
        };
      }) ?? [];

  return {
    ...entry.data,
    title: getMarkdownSection(entry.body, "Title")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Title")!)
      : entry.data.title,
    description: getMarkdownSection(entry.body, "Summary")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Summary")!)
      : entry.data.description,
    cards:
      parsedCards.length === entry.data.cards.length
        ? parsedCards
        : entry.data.cards,
  };
}

function parseWorksFeaturesBody(
  entry: Extract<LandingSectionEntry, { data: { section: "works-features" } }>,
): Omit<Extract<LandingSectionData, { section: "works-features" }>, "section"> {
  const titleFromBody = getMarkdownSection(entry.body, "Title");
  const descriptionFromBody = getMarkdownSection(entry.body, "Summary");
  const workflowStepsSection = getMarkdownSection(entry.body, "Workflow Steps");

  const parsedSteps =
    workflowStepsSection
      ?.split(/^###\s+/m)
      .slice(1)
      .map((rawStep, index) => {
        const lines = rawStep.trim().split("\n");
        const titleLine = lines.shift()?.trim() ?? "";
        const title = titleLine.replace(/^\d+\.\s+/, "").trim();
        const stepIdMatch = rawStep.match(/\*\*Step ID:\*\*\s+`([^`]+)`/);
        const fallbackStep = entry.data.steps[index];
        const stepId = stepIdMatch?.[1] ?? fallbackStep?.id;
        const stepTemplate = entry.data.steps.find(
          (step) => step.id === stepId,
        );

        if (!stepTemplate) {
          return null;
        }

        const description = normalizeMarkdownText(
          rawStep
            .replace(/^[^\n]*\n?/, "")
            .replace(/\*\*Step ID:\*\*\s+`[^`]+`\n?/g, "")
            .trim(),
        );

        return {
          id: stepTemplate.id,
          title: title || stepTemplate.title,
          description: description || stepTemplate.description,
        };
      })
      .filter((step): step is NonNullable<typeof step> => step !== null) ?? [];

  return {
    ...entry.data,
    title: titleFromBody
      ? normalizeMarkdownText(titleFromBody)
      : entry.data.title,
    description: descriptionFromBody
      ? normalizeMarkdownText(descriptionFromBody)
      : entry.data.description,
    steps:
      parsedSteps.length === entry.data.steps.length
        ? parsedSteps
        : entry.data.steps,
  };
}

function parseUseCasesBody(
  entry: Extract<LandingSectionEntry, { data: { section: "use-cases" } }>,
): Omit<Extract<LandingSectionData, { section: "use-cases" }>, "section"> {
  const tabsSection = getMarkdownSection(entry.body, "Audience Tabs");
  const parsedTabs =
    getMarkdownSubsections(tabsSection ?? "").map((tabBlock, index) => {
      const fallback = entry.data.tabs[index];
      const value = getBulletValue(tabBlock.body, "Value") ?? fallback.value;
      const matched =
        entry.data.tabs.find((tab) => tab.value === value) ?? fallback;
      const [contentPart, reviewsPart = ""] =
        tabBlock.body.split(/^Reviews:\s*$/m);
      const paragraphs = getParagraphs(
        contentPart
          .replace(/^- Value:.*$/m, "")
          .replace(/^- Image:.*$/m, "")
          .replace(/^- Link:.*$/m, ""),
      );
      const reviewMatches = Array.from(
        reviewsPart.matchAll(/^- (.+)$/gm),
        (match) => match[1].trim(),
      );

      return {
        ...matched,
        name: tabBlock.heading || matched.name,
        image: getBulletValue(tabBlock.body, "Image") ?? matched.image,
        link: getBulletValue(tabBlock.body, "Link") ?? matched.link,
        title: paragraphs[0] || matched.title,
        description: paragraphs[1] || matched.description,
        testimonials:
          reviewMatches.length === matched.testimonials.length
            ? matched.testimonials.map((item, reviewIndex) => ({
                ...item,
                review: reviewMatches[reviewIndex] || item.review,
              }))
            : matched.testimonials,
      };
    }) ?? [];

  return {
    ...entry.data,
    title: getMarkdownSection(entry.body, "Title")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Title")!)
      : entry.data.title,
    description: getMarkdownSection(entry.body, "Summary")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Summary")!)
      : entry.data.description,
    heading: getMarkdownSection(entry.body, "Heading")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Heading")!)
      : entry.data.heading,
    learnMoreLabel: getMarkdownSection(entry.body, "Learn More Label")
      ? normalizeMarkdownText(
          getMarkdownSection(entry.body, "Learn More Label")!.replace(/`/g, ""),
        )
      : entry.data.learnMoreLabel,
    tabs:
      parsedTabs.length === entry.data.tabs.length
        ? parsedTabs
        : entry.data.tabs,
  };
}

function parseTestimonialsBody(
  entry: Extract<LandingSectionEntry, { data: { section: "testimonials" } }>,
): Omit<Extract<LandingSectionData, { section: "testimonials" }>, "section"> {
  const itemsSection = getMarkdownSection(entry.body, "Testimonial Cards");
  const parsedItems =
    getMarkdownSubsections(itemsSection ?? "").map((itemBlock, index) => {
      const fallback = entry.data.items[index];
      const paragraphs = getParagraphs(
        itemBlock.body
          .replace(/^- Role:.*$/m, "")
          .replace(/^- Company:.*$/m, "")
          .replace(/^- Avatar:.*$/m, "")
          .replace(/^- Logo:.*$/m, "")
          .replace(/^- Dark logo:.*$/m, ""),
      );

      return {
        ...fallback,
        name: itemBlock.heading || fallback.name,
        designation:
          getBulletValue(itemBlock.body, "Role") ?? fallback.designation,
        companyName:
          getBulletValue(itemBlock.body, "Company") ?? fallback.companyName,
        avatar: getBulletValue(itemBlock.body, "Avatar") ?? fallback.avatar,
        companyLogo:
          getBulletValue(itemBlock.body, "Logo") ?? fallback.companyLogo,
        companyLogoDark:
          getBulletValue(itemBlock.body, "Dark logo") ??
          fallback.companyLogoDark,
        message: paragraphs[0] || fallback.message,
      };
    }) ?? [];

  return {
    ...entry.data,
    title: getMarkdownSection(entry.body, "Title")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Title")!)
      : entry.data.title,
    description: getMarkdownSection(entry.body, "Summary")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Summary")!)
      : entry.data.description,
    items:
      parsedItems.length === entry.data.items.length
        ? parsedItems
        : entry.data.items,
  };
}

function parsePricingBody(
  entry: Extract<LandingSectionEntry, { data: { section: "pricing" } }>,
): Omit<Extract<LandingSectionData, { section: "pricing" }>, "section"> {
  const plansSection = getMarkdownSection(entry.body, "Plans");
  const parsedPlans =
    getMarkdownSubsections(plansSection ?? "").map((planBlock, index) => {
      const fallback = entry.data.plans[index];
      const featureMatches = Array.from(
        planBlock.body.matchAll(/^- (.+)$/gm),
        (match) => match[1].trim(),
      ).filter(
        (line) => !line.includes("price:") && !line.includes("variant:"),
      );
      const paragraphs = getParagraphs(
        planBlock.body
          .replace(/^- Monthly price:.*$/m, "")
          .replace(/^- Yearly price:.*$/m, "")
          .replace(/^- Button variant:.*$/m, "")
          .replace(/^Features:\s*$/m, "")
          .replace(/^- /gm, "\n- "),
      );
      const monthlyPrice = getBulletValue(planBlock.body, "Monthly price");
      const yearlyPrice = getBulletValue(planBlock.body, "Yearly price");

      return {
        ...fallback,
        name: planBlock.heading || fallback.name,
        description: paragraphs[0] || fallback.description,
        price: monthlyPrice
          ? Number(monthlyPrice.replace(/[^\d.]/g, ""))
          : fallback.price,
        yearlyPrice: yearlyPrice
          ? Number(yearlyPrice.replace(/[^\d.]/g, ""))
          : fallback.yearlyPrice,
        buttonVariant:
          (getBulletValue(planBlock.body, "Button variant") as
            | "primary"
            | "secondary"
            | null) ?? fallback.buttonVariant,
        features: featureMatches.length ? featureMatches : fallback.features,
      };
    }) ?? [];

  const billingLabels = getMarkdownSection(entry.body, "Billing Labels");

  return {
    ...entry.data,
    title: getMarkdownSection(entry.body, "Title")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Title")!)
      : entry.data.title,
    description: getMarkdownSection(entry.body, "Summary")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Summary")!)
      : entry.data.description,
    heading: getMarkdownSection(entry.body, "Headline")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Headline")!)
      : entry.data.heading,
    subheading: getMarkdownSection(entry.body, "Supporting Copy")
      ? normalizeMarkdownText(
          getMarkdownSection(entry.body, "Supporting Copy")!,
        )
      : entry.data.subheading,
    monthlyLabel:
      (billingLabels && getBulletValue(billingLabels, "Monthly label")) ||
      entry.data.monthlyLabel,
    yearlyLabel:
      (billingLabels && getBulletValue(billingLabels, "Yearly label")) ||
      entry.data.yearlyLabel,
    yearlySaveLabel:
      (billingLabels && getBulletValue(billingLabels, "Savings label")) ||
      entry.data.yearlySaveLabel,
    plans:
      parsedPlans.length === entry.data.plans.length
        ? parsedPlans
        : entry.data.plans,
  };
}

function parseFaqBody(
  entry: Extract<LandingSectionEntry, { data: { section: "faq" } }>,
): Omit<Extract<LandingSectionData, { section: "faq" }>, "section"> {
  const questionsSection = getMarkdownSection(entry.body, "Questions");
  const parsedItems =
    getMarkdownSubsections(questionsSection ?? "").map(
      (questionBlock, index) => ({
        question: questionBlock.heading || entry.data.items[index]?.question,
        answer:
          normalizeMarkdownText(questionBlock.body) ||
          entry.data.items[index]?.answer,
      }),
    ) ?? [];
  const buttonsSection = getMarkdownSection(entry.body, "Buttons");
  const columnsSection = getMarkdownSection(entry.body, "Column Labels");
  const buttonMatches = Array.from(
    buttonsSection?.matchAll(/- ([^:]+):\s+`([^`]+)`/g) ?? [],
  );

  return {
    ...entry.data,
    title: getMarkdownSection(entry.body, "Title")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Title")!)
      : entry.data.title,
    description: getMarkdownSection(entry.body, "Summary")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Summary")!)
      : entry.data.description,
    heading: getMarkdownSection(entry.body, "Heading")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Heading")!)
      : entry.data.heading,
    subheading: getMarkdownSection(entry.body, "Subheading")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Subheading")!)
      : entry.data.subheading,
    docsButton: {
      label: buttonMatches[0]?.[1] || entry.data.docsButton.label,
      href: buttonMatches[0]?.[2] || entry.data.docsButton.href,
    },
    contactButton: {
      label: buttonMatches[1]?.[1] || entry.data.contactButton.label,
      href: buttonMatches[1]?.[2] || entry.data.contactButton.href,
    },
    leftColumnTitle:
      (columnsSection && getBulletValue(columnsSection, "Left column")) ||
      entry.data.leftColumnTitle,
    rightColumnTitle:
      (columnsSection && getBulletValue(columnsSection, "Right column")) ||
      entry.data.rightColumnTitle,
    items:
      parsedItems.length === entry.data.items.length
        ? parsedItems
        : entry.data.items,
  };
}

function parseCtaBody(
  entry: Extract<LandingSectionEntry, { data: { section: "cta" } }>,
): Omit<Extract<LandingSectionData, { section: "cta" }>, "section"> {
  const statsSection = getMarkdownSection(entry.body, "Stats");
  const parsedStats =
    getMarkdownSubsections(statsSection ?? "").map((statBlock, index) => {
      const fallback = entry.data.stats[index];
      const description = getParagraphs(statBlock.body)[0];
      const number = getBulletValue(statBlock.body, "Number");
      const pointNumber = getBulletValue(statBlock.body, "Point number");

      return {
        ...fallback,
        number: number ? Number(number) : fallback.number,
        pointNumber: pointNumber ? Number(pointNumber) : fallback.pointNumber,
        suffix: getBulletValue(statBlock.body, "Suffix") ?? fallback.suffix,
        description: description || fallback.description,
      };
    }) ?? [];
  const ctas = getMarkdownSection(entry.body, "Calls To Action");

  return {
    ...entry.data,
    heading: getMarkdownSection(entry.body, "Heading")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Heading")!)
      : entry.data.heading,
    description: getMarkdownSection(entry.body, "Summary")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Summary")!)
      : entry.data.description,
    primaryCta: {
      label:
        ctas?.match(/- Primary:\s+`([^`]+)`/)?.[1] ||
        entry.data.primaryCta.label,
      href:
        ctas?.match(/- Primary:\s+`[^`]+`\s+->\s+`([^`]+)`/)?.[1] ||
        entry.data.primaryCta.href,
    },
    secondaryCta: {
      label:
        ctas?.match(/- Secondary:\s+`([^`]+)`/)?.[1] ||
        entry.data.secondaryCta.label,
      href:
        ctas?.match(/- Secondary:\s+`[^`]+`\s+->\s+`([^`]+)`/)?.[1] ||
        entry.data.secondaryCta.href,
    },
    stats:
      parsedStats.length === entry.data.stats.length
        ? parsedStats
        : entry.data.stats,
  };
}

function parseFooterBody(
  entry: Extract<LandingSectionEntry, { data: { section: "footer" } }>,
): Omit<Extract<LandingSectionData, { section: "footer" }>, "section"> {
  const newsletterSection = getMarkdownSection(entry.body, "Newsletter");
  const formLabelsSection =
    newsletterSection && getMarkdownSection(newsletterSection, "Form Labels");
  const linkGroupsSection = getMarkdownSection(entry.body, "Link Groups");
  const parsedLinkGroups =
    getMarkdownSubsections(linkGroupsSection ?? "").map((groupBlock, index) => {
      const fallback = entry.data.links[index];
      const links = Array.from(
        groupBlock.body.matchAll(/^- (.+?) -> `([^`]+)`$/gm),
      ).map((match, linkIndex) => ({
        title: match[1].trim() || fallback.links[linkIndex]?.title,
        href: match[2].trim() || fallback.links[linkIndex]?.href,
      }));

      return {
        ...fallback,
        title: groupBlock.heading || fallback.title,
        links: links.length === fallback.links.length ? links : fallback.links,
      };
    }) ?? [];

  return {
    ...entry.data,
    newsletterTitle:
      (newsletterSection &&
        getMarkdownSubsection(newsletterSection, "Title") &&
        normalizeMarkdownText(
          getMarkdownSubsection(newsletterSection, "Title")!,
        )) ||
      entry.data.newsletterTitle,
    newsletterDescription:
      (newsletterSection &&
        getMarkdownSubsection(newsletterSection, "Summary") &&
        normalizeMarkdownText(
          getMarkdownSubsection(newsletterSection, "Summary")!,
        )) ||
      entry.data.newsletterDescription,
    newsletterInputPlaceholder:
      (formLabelsSection &&
        getBulletValue(formLabelsSection, "Input placeholder")) ||
      entry.data.newsletterInputPlaceholder,
    newsletterButtonLabel:
      (formLabelsSection &&
        getBulletValue(formLabelsSection, "Button label")) ||
      entry.data.newsletterButtonLabel,
    links:
      parsedLinkGroups.length === entry.data.links.length
        ? parsedLinkGroups
        : entry.data.links,
    copyrightSuffix: getMarkdownSection(entry.body, "Copyright")
      ? normalizeMarkdownText(getMarkdownSection(entry.body, "Copyright")!)
      : entry.data.copyrightSuffix,
  };
}

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
  const sectionEntryMap = new Map<LandingSectionId, LandingSectionEntry>();

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
    sectionEntryMap.set(entry.data.section, entry);
  }

  for (const requiredSectionId of REQUIRED_SECTION_IDS) {
    if (!sectionMap.has(requiredSectionId)) {
      throw new Error(
        `Missing required landing section file for "${requiredSectionId}" in src/content/landing-sections`,
      );
    }
  }

  await validateLandingSectionImages(sortedSections);

  const heroEntry = sectionEntryMap.get("hero");
  const featuresEntry = sectionEntryMap.get("features");
  const useCasesEntry = sectionEntryMap.get("use-cases");
  const testimonialsEntry = sectionEntryMap.get("testimonials");
  const pricingEntry = sectionEntryMap.get("pricing");
  const faqEntry = sectionEntryMap.get("faq");
  const ctaEntry = sectionEntryMap.get("cta");
  const footerEntry = sectionEntryMap.get("footer");

  if (!heroEntry || heroEntry.data.section !== "hero") {
    throw new Error(
      'Missing required landing section entry for "hero" in src/content/landing-sections',
    );
  }

  if (!featuresEntry || featuresEntry.data.section !== "features") {
    throw new Error(
      'Missing required landing section entry for "features" in src/content/landing-sections',
    );
  }

  if (!useCasesEntry || useCasesEntry.data.section !== "use-cases") {
    throw new Error(
      'Missing required landing section entry for "use-cases" in src/content/landing-sections',
    );
  }

  if (!testimonialsEntry || testimonialsEntry.data.section !== "testimonials") {
    throw new Error(
      'Missing required landing section entry for "testimonials" in src/content/landing-sections',
    );
  }

  if (!pricingEntry || pricingEntry.data.section !== "pricing") {
    throw new Error(
      'Missing required landing section entry for "pricing" in src/content/landing-sections',
    );
  }

  if (!faqEntry || faqEntry.data.section !== "faq") {
    throw new Error(
      'Missing required landing section entry for "faq" in src/content/landing-sections',
    );
  }

  if (!ctaEntry || ctaEntry.data.section !== "cta") {
    throw new Error(
      'Missing required landing section entry for "cta" in src/content/landing-sections',
    );
  }

  if (!footerEntry || footerEntry.data.section !== "footer") {
    throw new Error(
      'Missing required landing section entry for "footer" in src/content/landing-sections',
    );
  }

  const hero = omitSectionId(parseHeroBody(heroEntry));
  const features = omitSectionId(parseFeaturesBody(featuresEntry));

  const worksFeaturesEntry = sectionEntryMap.get("works-features");

  if (
    !worksFeaturesEntry ||
    worksFeaturesEntry.data.section !== "works-features"
  ) {
    throw new Error(
      'Missing required landing section entry for "works-features" in src/content/landing-sections',
    );
  }

  const worksFeatures = omitSectionId(
    parseWorksFeaturesBody(worksFeaturesEntry),
  );

  const useCases = omitSectionId(parseUseCasesBody(useCasesEntry));
  const testimonials = omitSectionId(parseTestimonialsBody(testimonialsEntry));
  const pricing = omitSectionId(parsePricingBody(pricingEntry));
  const faq = omitSectionId(parseFaqBody(faqEntry));
  const cta = omitSectionId(parseCtaBody(ctaEntry));
  const footer = omitSectionId(parseFooterBody(footerEntry));

  return {
    seo: settingsEntry.data.seo,
    integrations: settingsEntry.data.integrations,
    reviewsProxy: settingsEntry.data.reviewsProxy,
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
