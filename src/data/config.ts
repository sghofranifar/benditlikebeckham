// ─────────────────────────────────────────────────────────────
// App-wide settings. Teacher: this is the one file to edit for names,
// licence details and the secret behind the personal unlock codes.
// ─────────────────────────────────────────────────────────────

export const AUTHOR = {
  name: 'Sebastian Ghofranifar',
  role: 'Founder & author',
  school: 'German Swiss International School (GSIS), Hong Kong',
  email: 'sghofranifar@gsis.edu.hk',
  year: 2026,
};

export const LICENCE = {
  name: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
  short: 'CC BY 4.0',
  url: 'https://creativecommons.org/licenses/by/4.0/',
};

// Master password for the Teacher Panel (🔑 icon).
export const TEACHER_MASTER_PASSWORD = 'beckham7';

// Shared class code: every student can log in with their first name + this code.
// It opens Chapter 1 only. All later codes (Chapters 2–5 onwards) stay personal.
export const CLASS_CODE = 'JESS7';

// Secret mixed into every personal unlock / completion code.
// Change it for a new class or a new school year: all old codes stop working.
export const CODE_SECRET = 'gsis-k07-bilb-2026';

// Optional photos. Put JPGs with these names into the /img folder (see img/README.md).
// If a file is missing, the app simply shows its built-in illustration instead.
export const IMAGES = {
  roomWindow: 'img/room-window.jpg',
  hubHero: 'img/hub-floodlights.jpg',
};
