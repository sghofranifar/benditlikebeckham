import { useState } from 'react';

// Shows a teacher-supplied photo if the file exists in /img, otherwise nothing.
// The parent always reserves the space, so nothing jumps when the image loads (zero CLS).
export function OptionalImg({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} onError={() => setOk(false)} />;
}
