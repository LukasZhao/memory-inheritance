export type MarkdownSection = {
  heading: string;
  start: number;
  bodyStart: number;
  end: number;
};

export function renderList(items: string[]): string {
  if (items.length === 0) {
    return "- Not detected";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

export function ensureTrailingNewline(content: string): string {
  return content.endsWith("\n") ? content : `${content}\n`;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findSections(content: string): MarkdownSection[] {
  const matches = [...content.matchAll(/^##[ \t]+(.+?)[ \t]*$/gm)];

  return matches.map((match, index) => {
    const nextMatch = matches[index + 1];
    const headingStart = match.index ?? 0;
    const headingEnd = headingStart + match[0].length;
    const bodyStart = content[headingEnd] === "\r" && content[headingEnd + 1] === "\n" ? headingEnd + 2 : headingEnd + 1;

    return {
      heading: match[1].trim(),
      start: headingStart,
      bodyStart,
      end: nextMatch?.index ?? content.length
    };
  });
}

export function extractSection(content: string, sectionName: string): string | undefined {
  const querySlug = slugify(sectionName);
  const section = findSections(content).find((candidate) => {
    return slugify(candidate.heading) === querySlug || candidate.heading.toLowerCase() === sectionName.toLowerCase();
  });

  if (!section) {
    return undefined;
  }

  const body = content.slice(section.bodyStart, section.end).trim();
  return `## ${section.heading}${body ? `\n\n${body}` : ""}\n`;
}

export function hasSection(content: string, heading: string): boolean {
  const headingSlug = slugify(heading);
  return findSections(content).some((section) => slugify(section.heading) === headingSlug);
}

export function replaceSection(content: string, heading: string, body: string): string {
  const headingSlug = slugify(heading);
  const section = findSections(content).find((candidate) => slugify(candidate.heading) === headingSlug);
  const replacement = `## ${heading}\n\n${body.trimEnd()}\n\n`;

  if (!section) {
    return ensureTrailingNewline(`${content.trimEnd()}\n\n${replacement}`);
  }

  return ensureTrailingNewline(`${content.slice(0, section.start)}${replacement}${content.slice(section.end).trimStart()}`);
}

export function insertSectionsAfterTitle(content: string, sections: Record<string, string>): string {
  const renderedSections = Object.entries(sections)
    .map(([heading, body]) => `## ${heading}\n\n${body.trimEnd()}`)
    .join("\n\n");

  if (!renderedSections) {
    return ensureTrailingNewline(content);
  }

  const titleMatch = /^#[ \t]+.+[ \t]*$/m.exec(content);

  if (!titleMatch || titleMatch.index !== 0) {
    return ensureTrailingNewline(`${renderedSections}\n\n${content.trimStart()}`);
  }

  const insertAt = titleMatch[0].length;
  return ensureTrailingNewline(`${content.slice(0, insertAt)}\n\n${renderedSections}\n\n${content.slice(insertAt).trimStart()}`);
}
