import { useState } from 'react';
import { Modal } from './Modal';
import { LEVELS } from '../data/levels';
import { TEACHER_MASTER_PASSWORD } from '../data/config';
import { completionCode, unlockCode } from '../lib/codes';
import { useGame } from '../store';
import { SpringButton } from './ui';

const label = (id: number) => (id === 14 ? 'FT' : id === 15 ? 'XT' : String(id).padStart(2, '0'));

// Teacher-only panel, protected by the master password (src/data/config.ts).
export function TeacherPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useGame();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [tab, setTab] = useState<'codes' | 'device'>('codes');
  const [student, setStudent] = useState('');
  const [rename, setRename] = useState('');

  const tryLogin = () => {
    if (pw.trim().toLowerCase() === TEACHER_MASTER_PASSWORD) {
      s.setTeacherMode(true);
      setErr('');
      setPw('');
      setStudent(s.playerName);
    } else setErr('Incorrect master password.');
  };

  return (
    <Modal open={open} onClose={onClose} label="Teacher panel" wide>
      <h2 className="display t-h1 mb-1">🔑 Teacher Panel</h2>
      {!s.teacherMode ? (
        <div className="mt-4 max-w-sm">
          <p className="mb-3 text-sm text-chalk-dim">Enter the master password.</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryLogin()}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition focus:border-lime focus:shadow-glow"
            placeholder="Master password"
            aria-label="Master password"
          />
          <div className="mt-1 min-h-[1.25rem] text-sm text-rose">{err}</div>
          <SpringButton className="mt-2" onClick={tryLogin}>
            Log in
          </SpringButton>
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-4 flex gap-2">
            {(
              [
                ['codes', 'Student codes'],
                ['device', 'This device'],
              ] as const
            ).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] ${tab === k ? 'bg-lime text-ink-950' : 'border border-white/15 text-chalk-dim'}`}>
                {l}
              </button>
            ))}
          </div>

          {tab === 'codes' ? (
            <>
              <p className="mb-3 text-sm text-chalk-dim">
                Every code belongs to <b>one student name</b>. Type the name exactly as the student entered it (capitals and spaces don't matter). <b>Unlock code</b>: give it after checking the notebook. <b>Completion codes</b>: the app shows one after a game is won. Compare it with the code in the student's notebook to check the result is genuine.
              </p>
              <input
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                placeholder="Student name"
                aria-label="Student name"
                className="mb-4 w-full max-w-sm rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-bold outline-none focus:border-lime"
              />
              {student.trim() && (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[0.65rem] uppercase tracking-[0.16em] text-chalk-dim">
                      <tr>
                        <th className="px-3 py-2">Lvl</th>
                        <th className="px-3 py-2">Chapter</th>
                        <th className="px-3 py-2">Unlock code</th>
                        <th className="px-3 py-2">Completion codes ★ / ★★ / ★★★</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LEVELS.map((l) => (
                        <tr key={l.id} className="border-t border-white/5">
                          <td className="px-3 py-2 tabular-nums">{label(l.id)}</td>
                          <td className="px-3 py-2">
                            {l.chapter}: {l.title}
                          </td>
                          <td className="px-3 py-2">{l.open ? <span className="text-chalk-mute">open</span> : <code className="rounded bg-saffron/15 px-2 py-0.5 font-bold tracking-widest text-saffron">{unlockCode(student, l.id)}</code>}</td>
                          <td className="px-3 py-2 font-mono text-xs text-chalk-dim">{[1, 2, 3].map((n) => completionCode(student, l.id, n)).join('  ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-3 text-xs text-chalk-mute">Tip: print this table once per student, or open it on your own device during lessons. Change CODE_SECRET in src/data/config.ts for a new class: all old codes stop working.</p>
            </>
          ) : (
            <>
              <p className="mb-3 text-sm text-chalk-dim">
                Player on this device: <b className="text-chalk">{s.playerName || 'nobody yet'}</b>. Students cannot change their name themselves, so codes cannot be swapped between students.
              </p>
              <div className="mb-5 flex flex-wrap gap-2">
                <input value={rename} onChange={(e) => setRename(e.target.value)} placeholder="New name for this device" aria-label="New player name" className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 font-bold outline-none focus:border-lime" />
                <SpringButton
                  variant="outline"
                  disabled={!rename.trim()}
                  onClick={() => {
                    s.forceName(rename.trim());
                    setRename('');
                  }}
                >
                  Rename player
                </SpringButton>
              </div>
              <div className="flex flex-wrap gap-2">
                <SpringButton variant="outline" onClick={() => LEVELS.forEach((l) => s.unlock(l.id))}>
                  Unlock all levels
                </SpringButton>
                <SpringButton
                  variant="outline"
                  onClick={() => {
                    if (confirm('Reset ALL progress on this device? This cannot be undone.')) s.reset();
                  }}
                >
                  Reset this device
                </SpringButton>
              </div>
              <p className="mt-4 text-xs text-chalk-mute">While you are logged in, the game buttons are unlocked even if tasks are not ticked (for demos). Log out before handing the device back.</p>
            </>
          )}
          <div className="mt-5">
            <SpringButton variant="ghost" onClick={() => s.setTeacherMode(false)}>
              Log out
            </SpringButton>
          </div>
        </div>
      )}
    </Modal>
  );
}
