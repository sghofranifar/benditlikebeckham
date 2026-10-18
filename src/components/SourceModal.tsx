import { useEffect } from 'react';
import { Modal } from './Modal';
import { sourceById } from '../data/sources';
import { useGame } from '../store';
import { OptionalImg } from './OptionalImg';

// "Source file" window: cultural background, then a bridge back into the novel.
export function SourceModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const src = id ? sourceById(id) : undefined;
  const seeSource = useGame((s) => s.seeSource);
  useEffect(() => {
    if (id) seeSource(id);
  }, [id, seeSource]);

  return (
    <Modal open={!!src} onClose={onClose} label={src?.title ?? 'Source'} wide>
      {src && (
        <article>
          <div className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-saffron">
            Source file · {src.kicker}
          </div>
          <h2 className="display t-h1 mb-5 pr-10">
            <span className="mr-3">{src.icon}</span>
            {src.title}
          </h2>
          <OptionalImg key={src.id} src={src.image?.src ?? `img/source-${src.id}.jpg`} alt={src.image?.alt ?? src.title} className="mb-5 aspect-video w-full rounded-2xl object-cover" />
          <div className="space-y-3 leading-relaxed text-chalk/90">
            {src.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {src.facts && (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {src.facts.map((f) => (
                <li key={f} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-chalk-dim">
                  {f}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 rounded-2xl border border-lime/30 bg-lime/[0.06] p-4">
            <div className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-lime">📖 In the novel</div>
            <p className="text-sm leading-relaxed">{src.inTheNovel}</p>
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 p-4">
            <div className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-chalk-dim">✏️ Notebook: think about</div>
            <p className="font-hand text-xl leading-snug text-chalk">{src.thinkAbout}</p>
          </div>
        </article>
      )}
    </Modal>
  );
}
