/**
 * CCA Photography — local image set for demos and page backgrounds.
 * 35 images sourced from the GCP production bucket, local assets, and CCA photo downloads.
 */

import altRegistry from "./photography-alt-text-registry.json";
const alt = (filename: string, fallback: string): string =>
  (altRegistry as Record<string, string>)[filename] ?? fallback;

export interface CCAPhoto {
  src: string;
  alt: string;
}

export interface PhotoCollection {
  id: string;
  label: string;
  photos: CCAPhoto[];
}

export const ccaPhotography: CCAPhoto[] = [
  // GCP bucket + existing local assets
  { src: '/images/cca-photography/eoy-show-sp25.jpg', alt: alt('eoy-show-sp25.jpg', 'End of Year Show, Spring 2025') },
  { src: '/images/cca-photography/commencement-masters24.jpg', alt: alt('commencement-masters24.jpg', 'Commencement, Masters 2024') },
  { src: '/images/cca-photography/mfa-fine-arts-studio-fa22.jpg', alt: alt('mfa-fine-arts-studio-fa22.jpg', 'MFA Fine Arts Open Studio, Fall 2022') },
  { src: '/images/cca-photography/gala-event-2023.jpg', alt: alt('gala-event-2023.jpg', 'CCA Gala Event, 2023') },
  { src: '/images/cca-photography/fashion-materevolve-sp25.png', alt: alt('fashion-materevolve-sp25.png', 'Fashion Materevolve, Spring 2025') },
  { src: '/images/cca-photography/pole-banners-fa25.jpg', alt: alt('pole-banners-fa25.jpg', 'CCA Pole Banners, Fall 2025') },
  { src: '/images/cca-photography/student-work-unnamed.jpg', alt: alt('student-work-unnamed.jpg', 'Student Work') },
  { src: '/images/cca-photography/headshot-arr.png', alt: alt('headshot-arr.png', 'Student Portrait') },
  { src: '/images/cca-photography/game-arts-showcase.png', alt: alt('game-arts-showcase.png', 'Game Arts Showcase') },
  { src: '/images/cca-photography/mfa-thesis.jpg', alt: alt('mfa-thesis.jpg', 'MFA Thesis') },
  { src: '/images/cca-photography/roxie.jpg', alt: alt('roxie.jpg', 'Roxie Theater Event') },
  { src: '/images/cca-photography/thesis-poster.png', alt: alt('thesis-poster.png', 'Thesis Poster') },
  // Architecture — Final Conversations, Fall 2025
  { src: '/images/cca-photography/arch-final-conversations-fa25-022.jpg', alt: alt('arch-final-conversations-fa25-022.jpg', 'Architecture Final Conversations, Fall 2025') },
  { src: '/images/cca-photography/arch-final-conversations-fa25-026.jpg', alt: alt('arch-final-conversations-fa25-026.jpg', 'Architecture Final Conversations, Fall 2025') },
  { src: '/images/cca-photography/arch-final-conversations-fa25-083.jpg', alt: alt('arch-final-conversations-fa25-083.jpg', 'Architecture Final Conversations, Fall 2025') },
  { src: '/images/cca-photography/arch-final-conversations-fa25-084.jpg', alt: alt('arch-final-conversations-fa25-084.jpg', 'Architecture Final Conversations, Fall 2025') },
  { src: '/images/cca-photography/arch-final-conversations-fa25-150.jpg', alt: alt('arch-final-conversations-fa25-150.jpg', 'Architecture Final Conversations, Fall 2025') },
  { src: '/images/cca-photography/arch-final-conversations-fa25-152.jpg', alt: alt('arch-final-conversations-fa25-152.jpg', 'Architecture Final Conversations, Fall 2025') },
  // Architecture — How Soon Is Now, Spring 2026
  { src: '/images/cca-photography/arch-howsoon-sp26-59.jpg', alt: alt('arch-howsoon-sp26-59.jpg', 'Architecture How Soon Is Now, Spring 2026') },
  { src: '/images/cca-photography/arch-howsoon-sp26-68.jpg', alt: alt('arch-howsoon-sp26-68.jpg', 'Architecture How Soon Is Now, Spring 2026') },
  { src: '/images/cca-photography/arch-howsoon-sp26-77.jpg', alt: alt('arch-howsoon-sp26-77.jpg', 'Architecture How Soon Is Now, Spring 2026') },
  { src: '/images/cca-photography/arch-howsoon-sp26-79.jpg', alt: alt('arch-howsoon-sp26-79.jpg', 'Architecture How Soon Is Now, Spring 2026') },
  // Core 2D, Fall 2025
  { src: '/images/cca-photography/core-2d-perspective-collage-fa25.jpg', alt: alt('core-2d-perspective-collage-fa25.jpg', 'Core 2D Perspective Collage, Fall 2025') },
  // Design Senior Show, Fall 2025
  { src: '/images/cca-photography/design-senior-show-fa25-39.jpg', alt: alt('design-senior-show-fa25-39.jpg', 'Design Senior Show, Fall 2025') },
  { src: '/images/cca-photography/design-senior-show-fa25-54.jpg', alt: alt('design-senior-show-fa25-54.jpg', 'Design Senior Show, Fall 2025') },
  { src: '/images/cca-photography/design-senior-show-fa25-67.jpg', alt: alt('design-senior-show-fa25-67.jpg', 'Design Senior Show, Fall 2025') },
  // Fashion x Roots Stereo Film Stills
  { src: '/images/cca-photography/fashion-roots-stereo-film-01.jpg', alt: alt('fashion-roots-stereo-film-01.jpg', 'Fashion x Roots Stereo Film Still') },
  { src: '/images/cca-photography/fashion-roots-stereo-film-08.jpg', alt: alt('fashion-roots-stereo-film-08.jpg', 'Fashion x Roots Stereo Film Still') },
  { src: '/images/cca-photography/fashion-roots-stereo-film-12.jpg', alt: alt('fashion-roots-stereo-film-12.jpg', 'Fashion x Roots Stereo Film Still') },
  { src: '/images/cca-photography/fashion-roots-stereo-film-46.jpg', alt: alt('fashion-roots-stereo-film-46.jpg', 'Fashion x Roots Stereo Film Still') },
  // HAAVC Tea Ceremony, Fall 2025
  { src: '/images/cca-photography/haavc-tea-ceremony-fa25.jpg', alt: alt('haavc-tea-ceremony-fa25.jpg', 'HAAVC Tea Ceremony, Fall 2025') },
  // Staff Show, Fall 2025
  { src: '/images/cca-photography/staff-show-every-day-strange-fa25.jpg', alt: alt('staff-show-every-day-strange-fa25.jpg', 'Staff Show: Every Day Strange, Fall 2025') },
];

// --- Named subcollections for editor image panel ---

export const commencementPhotography: CCAPhoto[] = [
  { src: '/images/commencement-past/previousCommencementPhotos-002-03-2026-JL.jpg', alt: 'A group of ten students dressed in casual clothing pose together in front of decorative purple lanterns and colorful ribbons at an indoor celebration.' },
  { src: '/images/commencement-past/previousCommencementPhotos-003-03-2026-JL.jpg', alt: 'Three male graduates wearing black robes and colorful cultural sashes stand together outdoors on a brick plaza, smiling at the camera.' },
  { src: '/images/commencement-past/previousCommencementPhotos-004-03-2026-JL.jpg', alt: 'Two graduates in formal attire pose together outdoors; one wears a green dress and the other a pink blazer, both smiling in front of a white building.' },
  { src: '/images/commencement-past/previousCommencementPhotos-005-03-2026-JL.jpg', alt: 'Four graduates dressed in vibrant pink and purple outfits pose together in a parking lot during a bright, sunny commencement day.' },
  { src: '/images/commencement-past/previousCommencementPhotos-006-03-2026-JL.jpg', alt: 'Three graduates with colorful hair stand together on a white courtyard; one wears navy and black, another a gray dress, and the third a teal skirt with yellow sash.' },
  { src: '/images/commencement-past/previousCommencementPhotos-007-03-2026-JL.jpg', alt: 'Nine graduates in black academic robes and regalia pose together indoors, with two seated in front and seven standing behind them.' },
  { src: '/images/commencement-past/previousCommencementPhotos-008-03-2026-JL.jpg', alt: 'Two graduates in black robes with colorful cultural sashes sit together on red auditorium seats, smiling during the commencement ceremony.' },
  { src: '/images/commencement-past/previousCommencementPhotos-009-03-2026-JL.jpg', alt: 'Four graduates pose together outdoors against a brick building; they wear a mix of casual and formal attire, including vibrant pink and maroon colors.' },
  { src: '/images/commencement-past/previousCommencementPhotos-010-03-2026-JL.jpg', alt: 'A group of graduates in black robes and mortarboards stand together in front of a brick building, celebrating with raised arms and smiling at the camera.' },
  { src: '/images/commencement-past/previousCommencementPhotos-011-03-2026-JL.jpg', alt: 'A diverse group of young graduates wearing leis and graduation regalia pose together outdoors in front of a modern building with colorful turquoise architectural elements.' },
  { src: '/images/commencement-past/previousCommencementPhotos-012-03-2026-JL.jpg', alt: 'Two graduates embrace in front of a celebration backdrop decorated with purple and white balloons, with a paved courtyard and building visible behind them.' },
  { src: '/images/commencement-past/previousCommencementPhotos-013-03-2026-JL.jpg', alt: 'Graduates in caps, gowns, and cultural regalia stand in an auditorium with red seats, many wearing decorative sashes and stoles representing their cultural heritage.' },
  { src: '/images/commencement-past/previousCommencementPhotos-014-03-2026-JL.jpg', alt: 'Two speakers in academic regalia stand at a CCAlum podium during a commencement ceremony, with one holding a microphone as they address the audience.' },
  { src: '/images/commencement-past/previousCommencementPhotos-015-03-2026-JL.jpg', alt: 'A group of graduates in caps and gowns pose together indoors, smiling and posing for a photo in a hallway with windows and other attendees visible in the background.' },
  { src: '/images/commencement-past/previousCommencementPhotos-016-03-2026-JL.jpg', alt: 'Graduates in academic regalia celebrate in a courtyard, some wearing colorful leis and sashes, with historic buildings featuring arched architecture surrounding them.' },
  { src: '/images/commencement-past/previousCommencementPhotos-017-03-2026-JL.jpg', alt: 'A group of graduates wearing black gowns and yellow sashes pose together in a brick courtyard, standing in front of historic buildings on the campus grounds.' },
];

export const endOfYearShowPhotography: CCAPhoto[] = [
  { src: '/images/eoy-show-past/previousEOYShowPhotos-001-03-2026.jpg', alt: 'Gallery visitors interact with a colorful sculptural installation featuring turquoise and coral architectural forms with text reading \'SAINT SUSIE\' at a CCA End of Year Show exhibition.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-002-03-2026.jpg', alt: 'A bright orange sculptural model with curved and geometric forms sits on a light wood base in a gallery space with polished floors.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-003-03-2026.jpg', alt: 'An art installation featuring a figure wearing a deer head mask seated on a patterned textile floor, creating a surreal and contemplative composition.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-004-03-2026.jpg', alt: 'A smiling student artist holds a vibrant bouquet of flowers while standing in front of her colorful paintings featuring warm tones and figurative subjects.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-005-03-2026.jpg', alt: 'Wooden chairs and a table are repurposed as planters with grass and flora growing from their seats at a gallery installation exploring nature and function.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-006-03-2026.jpg', alt: 'Four student artists pose together in front of their large-scale white exhibition display in a gallery space.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-007-03-2026.jpg', alt: 'A woman in white clothing stands at a wooden table with grass-filled chair installations while gallery visitors explore the exhibition behind her.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-008-03-2026.jpg', alt: 'Overhead view of a bustling gallery space with multiple levels showing numerous visitors viewing diverse student artwork installations and displays.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-009-03-2026.jpg', alt: 'Two visitors examine colorful printed materials and publications at a gallery display table with framed photographs visible on a blue wall panel behind them.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-010-03-2026.jpg', alt: 'Two visitors view a digital display showing vibrant floral imagery mounted on a dark wall, with water glasses placed on a shelf below.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-011-03-2026.jpg', alt: 'A student artist presents her colorful digital project at a gallery booth, with vibrant yellow, blue, and coral colored posters and signage visible in the background.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-012-03-2026.jpg', alt: 'Visitors crouch around an orange exhibition display on the ground featuring a potted plant, printed materials, and colorful geometric graphics.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-013-03-2026.jpg', alt: 'A large crowd of visitors gathers outside a contemporary building with distinctive wooden architectural framework and white flowers in the landscaping.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-014-03-2026.jpg', alt: 'A performer wearing a bright yellow jacket and pink wings stands on a paved outdoor plaza surrounded by spectators and tall wooden pillars with colorful artwork.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-015-03-2026.jpg', alt: 'Visitors examine a gallery space featuring wooden geometric sculptures and architectural models displayed on white pedestals.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-016-03-2026.jpg', alt: 'Two visitors view a gallery wall covered with colorful patterned wallpaper and displaying various framed artworks in mixed media.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-017-03-2026.jpg', alt: 'A large circular wooden sculptural installation features geometric patterns, carved elements, and various hand-crafted wooden pieces arranged in a mandala-like composition.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-018-03-2026.jpg', alt: 'Two terracotta sculptural hands with textured surfaces emerge from a mound of dark soil on a gallery floor.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-019-03-2026.jpg', alt: 'A bright gallery space with industrial ceilings displays multiple large-scale installations including colorful panels and a dark sculptural structure with mixed media elements.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-020-03-2026.jpg', alt: 'A vibrant portrait painting featuring a young figure with decorative face patterns wearing a bright green jacket against a pink background with orange flame-like motifs.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-021-03-2026.jpg', alt: 'A student sits on a wooden bench in a minimalist studio space with green plants, shelving with decorative objects, and mood boards pinned to the wall behind him.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-022-03-2026.jpg', alt: 'A student in a yellow patterned shirt sits cross-legged on the floor surrounded by colorful design work, sketches, and fabric swatches displayed on black panels and teal fabric.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-023-03-2026.jpg', alt: 'An interactive gallery installation with the heading \'WHAT DOES THIS MEME?\' displays dozens of printed images and memes pinned to a white wall, with a QR code for viewer engagement.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-024-03-2026.jpg', alt: 'A student presents their work beside a monitor displaying brain imaging scans and a blue sculptural form with spikes mounted on the white gallery wall.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-025-03-2026.jpg', alt: 'A large-scale installation of accordion-folded yellow panels with illustrated figures and handwritten text arranged in an industrial gallery space.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-026-03-2026.jpg', alt: 'A close-up of hands using wooden tools to interact with a collection of textured, carved ceramic or wooden sculptural forms displayed at eye level.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-027-03-2026.jpg', alt: 'A student stands before their artwork featuring colorful geometric paintings with blue and white pottery imagery and a sculptural black form emerging from the white gallery floor.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-028-03-2026.jpg', alt: 'A vibrant large-scale digital projection displays abstract fiery patterns of reds, blues, and yellows on a curved screen in a modern gallery with visitors viewing the installation.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-029-03-2026.jpg', alt: 'A grid-based wall installation composed of small tiles alternating between copper-textured reliefs, black and white drawings, and teal backgrounds creating a modular artistic pattern.' },
  { src: '/images/eoy-show-past/previousEOYShowPhotos-030-03-2026.jpg', alt: 'A wooden cross-shaped display structure holds leather-bound books and white pages with black and white photographic prints and imagery arranged in a contemplative studio setting.' },
];

export const architectureConversationsGallery: CCAPhoto[] = [
  { src: '/images/cca-photography/arch-final-conversations-fa25-022.jpg', alt: alt('arch-final-conversations-fa25-022.jpg', 'Architecture Final Conversations, Fall 2025') },
  { src: '/images/cca-photography/arch-final-conversations-fa25-026.jpg', alt: alt('arch-final-conversations-fa25-026.jpg', 'Architecture Final Conversations, Fall 2025') },
  { src: '/images/cca-photography/arch-final-conversations-fa25-083.jpg', alt: alt('arch-final-conversations-fa25-083.jpg', 'Architecture Final Conversations, Fall 2025') },
  { src: '/images/cca-photography/arch-final-conversations-fa25-084.jpg', alt: alt('arch-final-conversations-fa25-084.jpg', 'Architecture Final Conversations, Fall 2025') },
  { src: '/images/cca-photography/arch-final-conversations-fa25-150.jpg', alt: alt('arch-final-conversations-fa25-150.jpg', 'Architecture Final Conversations, Fall 2025') },
  { src: '/images/cca-photography/arch-final-conversations-fa25-152.jpg', alt: alt('arch-final-conversations-fa25-152.jpg', 'Architecture Final Conversations, Fall 2025') },
];

export const photoCollections: PhotoCollection[] = [
  { id: 'cca', label: 'CCA Photography', photos: ccaPhotography },
  { id: 'commencement', label: 'Commencement', photos: commencementPhotography },
  { id: 'eoy-show', label: 'End of Year Show', photos: endOfYearShowPhotography },
  { id: 'architecture', label: 'Architecture Studio Conversations', photos: architectureConversationsGallery },
];
