import { useState } from 'react';
import { Modal } from './Modal';
import { LEVELS, TEACHER_MASTER_PASSWORD } from '../data/levels';
import { useGame } from '../store';
import { SpringButton } from './ui';

// Teacher-only panel, protected by the master password (see src/data/levels.ts).
export function TeacherPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useGame();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const tryLogin = () => {
    if (pw.trim().toLowerCase() === TEACHER_MASTER_PASSWORD) {
      s.setTeacherMode(true);
      setErr('');
      setPw('');
    } else setErr('Incorrect master password.');
  };

  return (
    <Modal open={open} onClose={onClose} label="Teacher panel" wide>
      <h2 className="display t-h1 mb-1">🔑 Teacher Panel</h2>
      {!s.teacherMode ? (
        <div className="mt-4 max-w-sm">
          <p className="mb-3 text-sm text-chalk-dim">Enter the master password to see the chapter passwords.</p>
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
          <p className="mb-4 text-sm text-chalk-dim">
            How it works: a student finishes a chapter in their notebook and shows you. You check it and tell them the password for the NEXT chapter. Passwords are not case-sensitive.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[0.65rem] uppercase tracking-[0.16em] text-chalk-dim">
                <tr>
                  <th className="px-3 py-2">Lvl</th>
                  <th className="px-3 py-2">Chapter</th>
                  <th className="px-3 py-2">Week</th>
                  <th className="px-3 py-2">Password</th>
                  <th className="px-3 py-2">On this device</th>
                </tr>
              </thead>
              <tbody>
                {LEVELS.map((l) => (
                  <tr key={l.id} className="border-t border-white/5">
                    <td className="px-3 py-2 tabular-nums">{l.id}</td>
                    <td className="px-3 py-2">
                      {l.chapter}: {l.title}
                    </td>
                    <td className="px-3 py-2">{l.week}</td>
                    <td className="px-3 py-2">
                      <code className="rounded bg-saffron/15 px-2 py-0.5 font-bold text-saffron">{l.password ?? 'open'}</code>
                    </td>
                    <td className="px-3 py-2">{s.unlocked.includes(l.id) ? <span className="text-lime">unlocked{s.gameStars[l.id] ? ` · ${s.gameStars[l.id]}★` : ''}</span> : <span className="text-chalk-mute">locked</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <SpringButton variant="outline" onClick={() => LEVELS.forEach((l) => s.unlock(l.id))}>
              Unlock all (demo)
            </SpringButton>
            <SpringButton
              variant="outline"
              onClick={() => {
                if (confirm('Reset ALL progress on this device? This cannot be undone.')) s.reset();
              }}
            >
              Reset this device
            </SpringButton>
            <SpringButton variant="ghost" onClick={() => s.setTeacherMode(false)}>
              Log out
            </SpringButton>
          </div>
          <p className="mt-4 text-xs text-chalk-mute">Master password: change TEACHER_MASTER_PASSWORD in src/data/levels.ts. Progress is saved in this browser only.</p>
        </div>
      )}
    </Modal>
  );
}
