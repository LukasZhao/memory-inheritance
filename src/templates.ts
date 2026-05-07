import { renderList } from "./markdown.js";
import type { MemoryDefinition, ProjectInfo } from "./types.js";

type SectionMap = Record<string, string>;

function joinSections(title: string, sections: SectionMap): string {
  const renderedSections = Object.entries(sections).map(([heading, body]) => {
    return `## ${heading}\n\n${body.trimEnd()}`;
  });

  return `${title}\n\n${renderedSections.join("\n\n")}\n`;
}

function projectMemorySections(info: ProjectInfo): { autoSections: SectionMap; manualSections: SectionMap } {
  return {
    autoSections: {
      "Project Overview": info.projectName,
      "Detected Tech Stack": renderList(info.detectedStack),
      "Important Files and Folders": renderList(info.importantFiles),
      "Common Commands": renderList(info.commands)
    },
    manualSections: {
      "Development Notes": "- Add manual notes here.\n- Describe project intent."
    }
  };
}

function agentsSections(info: ProjectInfo): { autoSections: SectionMap; manualSections: SectionMap } {
  return {
    autoSections: {
      "Project Summary": info.projectName,
      "Detected Tech Stack": renderList(info.detectedStack),
      Commands: renderList(info.commands)
    },
    manualSections: {
      "Codex Adapter": "This file is the Codex adapter for Memory Inheritance. PROJECT_MEMORY.md is the canonical project memory.",
      "Codex Instructions": "- Read PROJECT_MEMORY.md before editing.\n- Preserve the project intent described in PROJECT_MEMORY.md.\n- Keep changes minimal and documented.\n- Run `npx mem-extract sync` after meaningful changes."
    }
  };
}

function claudeSections(info: ProjectInfo): { autoSections: SectionMap; manualSections: SectionMap } {
  return {
    autoSections: {
      "Project Context": info.projectName,
      "Detected Tech Stack": renderList(info.detectedStack),
      "Useful Commands": renderList(info.commands)
    },
    manualSections: {
      "Claude Code Adapter": "This file is the Claude Code adapter for Memory Inheritance. PROJECT_MEMORY.md is the canonical project memory.",
      "Claude Code Instructions": "- Read PROJECT_MEMORY.md before editing.\n- Preserve existing architecture and manual notes.\n- Update project memory after meaningful changes by running `npx mem-extract sync`."
    }
  };
}

export function buildMemoryDefinitions(info: ProjectInfo): MemoryDefinition[] {
  const projectMemory = projectMemorySections(info);
  const agents = agentsSections(info);
  const claude = claudeSections(info);

  return [
    {
      fileName: "PROJECT_MEMORY.md",
      content: joinSections("# PROJECT_MEMORY.md", {
        ...projectMemory.autoSections,
        ...projectMemory.manualSections
      }),
      ...projectMemory
    },
    {
      fileName: "AGENTS.md",
      content: joinSections("# AGENTS.md", {
        ...agents.manualSections,
        ...agents.autoSections
      }),
      ...agents
    },
    {
      fileName: "CLAUDE.md",
      content: joinSections("# CLAUDE.md", {
        ...claude.manualSections,
        ...claude.autoSections
      }),
      ...claude
    }
  ];
}
