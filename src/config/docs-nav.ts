export interface DocsNavItem {
  label: string;
  slug: string; // URL is always /docs/{slug} (or /docs/ when slug is "")
}

export interface DocsNavSection {
  label: string;
  key: string; // matches 'section' frontmatter field
  items: DocsNavItem[];
}

export const docsNav: DocsNavSection[] = [
  {
    label: "Overview",
    key: "overview",
    items: [
      { label: "Docs Home", slug: "" },
      { label: "Getting Started", slug: "getting-started" },
    ],
  },
  {
    label: "Architecture",
    key: "architecture",
    items: [
      { label: "Phase System", slug: "phase-system" },
      { label: "Content Collections", slug: "content-collections" },
      { label: "Styling & Animation", slug: "styling-and-animation" },
    ],
  },
  {
    label: "Content & Workflow",
    key: "workflow",
    items: [
      { label: "Content Workflow", slug: "content-workflow" },
      { label: "Asset Pipeline", slug: "asset-pipeline" },
    ],
  },
  {
    label: "Reference",
    key: "reference",
    items: [
      { label: "Component Guide", slug: "component-guide" },
      { label: "Component Catalog", slug: "component-catalog" },
      { label: "Schema Reference", slug: "schema-reference" },
      { label: "Route Index", slug: "route-index" },
    ],
  },
  {
    label: "Operations",
    key: "ops",
    items: [
      { label: "Deployment", slug: "deployment" },
      { label: "GTM Tracking", slug: "gtm-direct-post-form-tracking" },
      { label: "Troubleshooting", slug: "troubleshooting" },
    ],
  },
];
