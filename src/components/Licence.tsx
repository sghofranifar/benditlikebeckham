import { motion } from 'framer-motion';
import { useState } from 'react';
import { Modal } from './Modal';
import { AUTHOR, LICENCE } from '../data/config';
import { spring } from '../lib/motion';

// "Licence & credits" button + modal (disclaimer).
export function LicenceButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        transition={spring.snappy}
        onClick={() => setOpen(true)}
        className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-ink-950/60 font-extrabold uppercase tracking-[0.12em] text-chalk-dim hover:text-chalk ${compact ? 'h-9 px-3 text-[0.65rem]' : 'px-4 py-2 text-xs'}`}
      >
        ⓘ <span>{compact ? LICENCE.short : `Licence & credits · ${LICENCE.short}`}</span>
      </motion.button>
      <Modal open={open} onClose={() => setOpen(false)} label="Licence and credits" wide>
        <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-lime">Licence & credits</div>
        <h2 className="display t-h1 mt-1 pr-10">Bend It Quest</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-chalk/90">
          <p>
            © {AUTHOR.year} <b>{AUTHOR.name}</b> ({AUTHOR.role}), <b>{AUTHOR.school}</b>.
            <br />
            Contact:{' '}
            <a className="text-lime underline" href={`mailto:${AUTHOR.email}`}>
              {AUTHOR.email}
            </a>
          </p>
          <div className="rounded-2xl border border-lime/30 bg-lime/[0.06] p-4">
            <p>
              This learning app (its design, code, tasks, games and original texts) is licensed under the{' '}
              <a className="text-lime underline" href={LICENCE.url} target="_blank" rel="noreferrer">
                {LICENCE.name}
              </a>
              .
            </p>
            <p className="mt-2">
              You may share and adapt it for any purpose, <b>provided you give appropriate credit</b>: name the founder <b>{AUTHOR.name}</b> and the <b>German Swiss International School</b>, link to the licence, and indicate if changes were made.
            </p>
            <p className="mt-2 font-mono text-xs text-chalk-dim">
              Suggested credit: "Bend It Quest" by {AUTHOR.name}, {AUTHOR.school}, {LICENCE.short}.
            </p>
          </div>
          <div>
            <div className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-chalk-dim">Not covered by this licence</div>
            <ul className="list-disc space-y-1 pl-5 text-chalk-dim">
              <li>
                <i>Bend It Like Beckham</i> (novel) © 2002 Narinder Dhami, Hodder Children's Books; script © 2002 Bilb Productions Ltd. Short quotations are used for educational purposes only. Students need their own copy of the novel.
              </li>
              <li>Any photos added to the /img folder remain under their own licences (see credits in img/README.md).</li>
              <li>Fonts: Anton, Manrope, Caveat and VT323 (SIL Open Font Licence). Software: React, Framer Motion, Zustand, Tailwind CSS (MIT Licence).</li>
              <li>This app is an independent teaching resource. It is not affiliated with or endorsed by the author or publisher of the novel, the film's makers, the Premier League, the FA, any football club, or David Beckham. The character illustrations are original drawings.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
}
