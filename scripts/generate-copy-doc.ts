/**
 * Generate a structured Markdown document of all user-facing copy
 * for editorial review. Run with: bun run scripts/generate-copy-doc.ts
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';

const ROOT = join(import.meta.dir, '..');
const CONTENT = join(ROOT, 'src/content');
const PAGES = join(ROOT, 'src/pages');

// ── Helpers ──

function readJSON(path: string) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function readDir(dir: string, ext = '.json') {
  return readdirSync(dir)
    .filter(f => f.endsWith(ext))
    .sort()
    .map(f => ({ name: basename(f, ext), data: readJSON(join(dir, f)) }));
}

function md(lines: string[]) {
  return lines.filter(Boolean).join('\n');
}

// ── Gather data ──

const commencementInfo = readJSON(join(CONTENT, 'commencement-info/current.json'));
const events = readDir(join(CONTENT, 'events'));
const people = readDir(join(CONTENT, 'people'));

// Lookup helpers for specific events
const eventBySlug = (slug: string) => events.find(e => e.name === slug)?.data;
const undergradCommencement = eventBySlug('commencement-undergraduate');
const gradCommencement = eventBySlug('commencement-graduate');
const showcaseEvent = eventBySlug('showcase');

// ── Build document ──

const sections: string[] = [];

sections.push('# CCA 2026 Celebration Site — Copy Review\n');
sections.push('> This document contains all user-facing copy from the site for editorial review.\n> Generated on ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '.\n');

// ────────────────────────────────────────────────────
// Homepage
// ────────────────────────────────────────────────────
sections.push('---\n\n## Homepage\n');
sections.push(md([
  '### Hero',
  '- **Eyebrow:** California College of the Arts',
  '- **Year:** 2026',
  '- **Label (pre-event):** Celebrations',
  '- **Label (post-event):** Congratulations',
  '- **Tagline (pre-event):** Honoring the creativity, resilience, and vision of our graduating class.',
  '- **Tagline (post-event):** Honoring the creativity, resilience, and vision of the Class of 2026.',
  '',
  '### Hero CTAs',
  '- **Pre-event:** "Explore Events" / "Subscribe for Updates"',
  '- **Post-event:** "Commencement" / "Browse Events"',
  '',
  '### Commencement Section',
  '- **Date label:** May 16, 2026',
  '- **Number:** 119th',
  '- **Title:** Commencement',
  `- **Description:** ${undergradCommencement?.description ?? '(from commencement-undergraduate event)'}`,
  '- **CTA:** Commencement Details',
  '',
  '### Graduation Exhibitions Section',
  '- **Date label:** May 15, 2026',
  '- **Number:** 700+',
  '- **Title:** Graduating Students',
  `- **Description:** ${showcaseEvent?.description ?? '(from showcase event)'}`,
  '- **CTA:** Explore Exhibitions',
  '',
  '### Quote Block',
  '- **Text:** "Our graduates leave CCA not just as skilled artists and designers, but as creative leaders ready to shape a more just and joyful world."',
  '- **Attribution:** Tamara Alvarado, President, California College of the Arts',
  '',
  '### Email Signup Section',
  '- **Heading:** Don\'t Miss a Moment',
  '- **Description:** Sign up for the CCA mailing list to receive updates on commencement, exhibitions, showcases, and more.',
]));

// ────────────────────────────────────────────────────
// Commencement Hub
// ────────────────────────────────────────────────────
sections.push('\n---\n\n## Commencement Hub (/commencement/)\n');
sections.push(md([
  '### Hero',
  `- **Label:** CCA ${commencementInfo.commencementNumber}`,
  '- **Title:** Commencement',
  '- **Subtitle (pre-event):** Celebrate the Class of 2026',
  '- **Subtitle (post-event):** Congratulations to the Class of 2026',
  '- **CTA:** View Ceremonies',
  '',
  '### Ceremonies Section',
  '- **Section label:** Ceremonies',
  '- **Section heading:** Two Ceremonies, One Celebration',
  '- **Ceremony card badges:** "Undergraduate" / "Graduate"',
  '- **Card CTA:** Details →',
  '',
  '### Honorees Section',
  '- **Section label:** Honoring',
  '- **Section heading:** Celebrating Extraordinary People',
  '',
  '### Special Celebrations Section',
  '- **Section label:** Pre-Commencement',
  '- **Section heading:** Special Celebrations',
  '- **Description:** Join us for celebrations honoring all graduating students before the main ceremonies.',
  '',
  '### Past Gallery Section',
  '- **Section label:** Past Commencements',
  '- **Section title:** Celebrating Generations of Graduates',
  '',
  '### In Memoriam Section',
  '- **Section label:** In Memoriam',
  '- **Section heading:** Remembering Members of Our Community',
  '- **Intro:** We honor the members of the CCA community who passed during this academic year. Their contributions continue to inspire us.',
]));

// ────────────────────────────────────────────────────
// Ceremony Pages (shared template)
// ────────────────────────────────────────────────────
sections.push('\n---\n\n## Ceremony Detail Pages (/commencement/undergraduate/ & /commencement/graduate/)\n');
sections.push(md([
  '### Section headings (hardcoded in CeremonyPage component)',
  '- Featured Speakers & Honorees',
  '- DIY Celebration Kit',
  '- **DIY Kit intro:** Celebrate your way — download printable decorations, social media frames, and more to make the day your own.',
  '- By the Numbers',
  '- Student Works',
  '- Ceremony Video',
  '- Digital Program',
  '- **Digital Program CTA:** View Full Program →',
  '- Questions & Contact',
  '- **Contact text:** For details on regalia, guest tickets, accessibility, parking, and everything else about ceremony day, visit the CCA Commencement Portal.',
  '- **Contact link:** CCA Commencement Portal →',
]));

// ────────────────────────────────────────────────────
// Commencement Info — For Students
// ────────────────────────────────────────────────────
sections.push('\n---\n\n## Commencement — For Students\n');
sections.push(md([
  `- **Heading:** ${commencementInfo.forStudents.heading}`,
  `- **Summary:** ${commencementInfo.forStudents.summary}`,
  '',
  '### Full Content',
  '',
  commencementInfo.forStudents.content,
]));

// ────────────────────────────────────────────────────
// Commencement Info — For Families
// ────────────────────────────────────────────────────
sections.push('\n---\n\n## Commencement — For Families & Friends\n');
sections.push(md([
  `- **Heading:** ${commencementInfo.forFamilies.heading}`,
  `- **Summary:** ${commencementInfo.forFamilies.summary}`,
  '',
  '### Full Content',
  '',
  commencementInfo.forFamilies.content,
]));

// ────────────────────────────────────────────────────
// Events
// ────────────────────────────────────────────────────
sections.push('\n---\n\n## Events\n');

for (const { name, data } of events) {
  sections.push(`### ${data.title}\n`);
  const lines = [
    `- **Slug:** ${name}`,
    `- **Short title:** ${data.shortTitle ?? '—'}`,
    `- **Type:** ${data.type}`,
    `- **Date:** ${data.date}${data.endDate ? ` – ${data.endDate}` : ''}`,
    `- **Time:** ${data.time ?? '—'}`,
    `- **Location:** ${data.location}`,
    data.address ? `- **Address:** ${data.address}` : '',
    `- **Description:** ${data.description}`,
    data.longDescription ? `- **Long description:** ${data.longDescription}` : '',
  ];

  if (data.schedule) {
    lines.push('', '**Schedule:**');
    for (const s of data.schedule) {
      lines.push(`- ${s.time} — ${s.label}`);
    }
  }

  if (data.ceremonyProgram) {
    const cp = data.ceremonyProgram;
    lines.push('', '**Ceremony Program:**');
    if (cp.studentSpeaker) {
      lines.push(`- Student Speaker: ${cp.studentSpeaker.name} (${cp.studentSpeaker.program})`);
      lines.push(`  - Speech highlights: ${cp.studentSpeaker.speechHighlights}`);
    }
    if (cp.grandMarshal) {
      lines.push(`- Grand Marshal: ${cp.grandMarshal.name}, ${cp.grandMarshal.title}`);
    }
    if (cp.presidentName) {
      lines.push(`- President: ${cp.presidentName}`);
    }
    if (cp.landAcknowledgment) {
      lines.push(`- **Land Acknowledgment:** ${cp.landAcknowledgment}`);
    }
    if (cp.disclaimer) {
      lines.push(`- **Disclaimer:** ${cp.disclaimer}`);
    }
    if (cp.programItems) {
      lines.push('', '**Program Order:**');
      for (const item of cp.programItems) {
        const presenter = item.presenter ? ` — ${item.presenter}` : '';
        const desc = item.description ? ` (${item.description})` : '';
        lines.push(`${item.order}. ${item.label}${presenter}${desc}`);
      }
    }
  }

  sections.push(md(lines) + '\n');
}

// ────────────────────────────────────────────────────
// Graduation Exhibitions / Thesis Page
// ────────────────────────────────────────────────────
sections.push('\n---\n\n## Graduation Exhibitions Page (/thesis/)\n');
sections.push(md([
  '### Hero',
  '- **Label:** CCA 2026',
  '- **Title:** Graduation Exhibitions',
  '- **Subtitle:** (dynamic date range) · CCA San Francisco Campus',
  '',
  '### Hero CTAs (phase-variant)',
  '- **Save-the-date:** "Learn More"',
  '- **Pre-event:** "Subscribe for Updates" / "Learn More"',
  '- **Post-event:** "Browse Student Work"',
  '',
  '### About Section',
  '- **Section label:** About the Exhibitions',
  '- **Section heading:** An Evening of Art, Design & Making',
  '- **CTA:** Subscribe for Updates',
  '',
  '### All Events Section',
  '- **Section label:** Class of 2026',
  '- **Section heading:** All Celebration Events',
  '- **Description:** From commencement ceremonies to thesis exhibitions and showcases, explore the full range of events celebrating the Class of 2026.',
  '',
  '### Past Gallery',
  '- **Section label:** Past Exhibitions',
  '- **Section title:** A Legacy of Creative Work',
]));

// ────────────────────────────────────────────────────
// Showcase / Student Showcase Page
// ────────────────────────────────────────────────────
sections.push('\n---\n\n## Student Showcase Page (/showcase/)\n');
sections.push(md([
  '- **Page title:** Student Showcase',
  '- **Page description:** Explore creative works and meet the talented artists, designers, and makers of CCA\'s Class of 2026.',
  '',
  '### Thesis Work Gallery',
  '- **Section label:** Thesis Work',
  '- **Section title:** Selected Works',
  '- **Link:** View all works',
  '',
  '### Meet the Students CTA',
  '- **Eyebrow:** Class of 2026',
  '- **Heading:** Meet the Students',
  '- **Count:** (dynamic) artists, designers, writers & architects',
]));

// ────────────────────────────────────────────────────
// People / Honorees
// ────────────────────────────────────────────────────
sections.push('\n---\n\n## People / Honorees\n');

for (const { name, data } of people) {
  sections.push(`### ${data.name}\n`);
  sections.push(md([
    `- **Role:** ${data.role}`,
    `- **Title:** ${data.title}`,
    `- **Bio:** ${data.bio}`,
    data.ccaConnection ? `- **CCA Connection:** ${data.ccaConnection}` : '',
  ]) + '\n');
}

// ────────────────────────────────────────────────────
// President's Quote
// ────────────────────────────────────────────────────
sections.push('\n---\n\n## President\'s Quote (Ceremony Pages)\n');
sections.push(md([
  `- **Text:** "${commencementInfo.presidentQuote.text}"`,
  `- **Attribution:** ${commencementInfo.presidentQuote.attribution}`,
]));

// ────────────────────────────────────────────────────
// Statistics
// ────────────────────────────────────────────────────
sections.push('\n---\n\n## Statistics\n');
for (const stat of commencementInfo.statistics) {
  sections.push(`- **${stat.label}:** ${stat.value}${stat.detail ? ` (${stat.detail})` : ''}`);
}

// ────────────────────────────────────────────────────
// Downloadable Assets
// ────────────────────────────────────────────────────
sections.push('\n\n---\n\n## Downloadable Assets\n');
for (const asset of commencementInfo.downloadableAssets) {
  sections.push(`- **${asset.label}:** ${asset.description}`);
}

// ────────────────────────────────────────────────────
// In Memoriam
// ────────────────────────────────────────────────────
sections.push('\n\n---\n\n## In Memoriam\n');
for (const person of commencementInfo.inMemoriam) {
  sections.push(`- ${person.name} — ${person.role}`);
}

// ────────────────────────────────────────────────────
// Subscribe Page
// ────────────────────────────────────────────────────
sections.push('\n\n---\n\n## Subscribe Page (/subscribe/)\n');
sections.push(md([
  '- **Page title:** Subscribe',
  '- **Page description:** Sign up for the CCA 2026 Celebrations mailing list to receive event updates and RSVP reminders.',
  '- **Visual label:** CCA Celebrations',
  '- **Heading:** Stay Updated',
  '- **Intro:** Join the CCA 2026 Celebrations mailing list. We\'ll send you event announcements, schedule changes, RSVP reminders, and other important updates as commencement, graduation exhibitions, and thesis exhibitions approach.',
]));

// ────────────────────────────────────────────────────
// Email Signup Component (defaults)
// ────────────────────────────────────────────────────
sections.push('\n\n---\n\n## Email Signup Component (default copy)\n');
sections.push(md([
  '- **Default heading:** Stay in the Loop',
  '- **Default description:** Sign up for the CCA 2026 Celebrations mailing list to get event updates, RSVP reminders, and more.',
  '- **Placeholder:** you@example.com',
  '- **Button:** Subscribe',
  '- **Success message:** You\'re on the list! We\'ll be in touch soon.',
  '- **Error message:** Something went wrong. Please try again.',
  '- **Privacy note:** We respect your privacy. Unsubscribe anytime.',
]));

// ────────────────────────────────────────────────────
// Contact Info
// ────────────────────────────────────────────────────
sections.push('\n\n---\n\n## Contact Information\n');
sections.push(md([
  `- **Email:** ${commencementInfo.contact.email}`,
  `- **Phone:** ${commencementInfo.contact.phone}`,
  `- **Intranet URL:** ${commencementInfo.intranetUrl}`,
]));

// ────────────────────────────────────────────────────
// Phase-Variant Copy Summary
// ────────────────────────────────────────────────────
sections.push('\n\n---\n\n## Phase-Variant Copy Summary\n');
sections.push(md([
  'The following text changes based on the current site phase (save-the-date → pre-event → during-event → post-event):\n',
  '| Location | Phase | Copy |',
  '|----------|-------|------|',
  '| Homepage hero label | Pre-event | Celebrations |',
  '| Homepage hero label | Post-event | Congratulations |',
  '| Homepage hero tagline | Pre-event | Honoring the creativity, resilience, and vision of our graduating class. |',
  '| Homepage hero tagline | Post-event | Honoring the creativity, resilience, and vision of the Class of 2026. |',
  '| Homepage hero CTA | Pre-event | Explore Events / Subscribe for Updates |',
  '| Homepage hero CTA | Post-event | Commencement / Browse Events |',
  '| Commencement hero subtitle | Pre-event | Celebrate the Class of 2026 |',
  '| Commencement hero subtitle | Post-event | Congratulations to the Class of 2026 |',
  '| Grad Exhibitions hero CTA | Save-the-date | Learn More |',
  '| Grad Exhibitions hero CTA | Pre-event | Subscribe for Updates / Learn More |',
  '| Grad Exhibitions hero CTA | Post-event | Browse Student Work |',
  '| Commencement honorees | Hidden in | save-the-date |',
  '| Special celebrations | Hidden in | save-the-date |',
  '| In Memoriam | Visible from | during-event onward |',
]));

// ── Write output ──

const output = sections.join('\n');
const outPath = join(ROOT, 'copy-review.md');
writeFileSync(outPath, output, 'utf-8');

console.log(`✓ Written to ${outPath} (${output.split('\n').length} lines)`);
