'use client';

import { useQuery } from '@tanstack/react-query';
import { MapPin, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/field';
import { useDebounced } from '@/hooks/use-debounced';
import { api } from '@/lib/api';
import type { CourseSummary } from '@/lib/types';

/** Search-and-select for courses. Shows the chosen course with a way to change it. */
export function CoursePicker({
  id,
  value,
  initialName,
  onChange,
  invalid,
}: {
  id: string;
  value: string | null;
  initialName?: string;
  onChange: (course: CourseSummary | null) => void;
  invalid?: boolean;
}) {
  const t = useTranslations('app.courses');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(value && initialName ? { id: value, name: initialName } : null);
  const query = useDebounced(q);
  const { data, isFetching } = useQuery({
    queryKey: ['courses', query],
    queryFn: () => api.get<CourseSummary[]>(`/courses?q=${encodeURIComponent(query)}`),
    enabled: !selected,
  });

  if (selected && value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-line-strong bg-paper px-3.5 py-2.5">
        <span className="flex items-center gap-2 font-medium">
          <MapPin className="size-4 text-muted" aria-hidden />
          {selected.name}
        </span>
        <button
          type="button"
          className="text-sm underline underline-offset-4"
          onClick={() => {
            setSelected(null);
            onChange(null);
          }}
        >
          {t('change')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <Input id={id} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search')} className="pl-9" aria-invalid={invalid} autoComplete="off" />
      </div>
      <ul aria-label={t('results')} aria-busy={isFetching} className="max-h-60 divide-y divide-line overflow-y-auto rounded-md border border-line">
        {data?.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => {
                setSelected(c);
                onChange(c);
              }}
              className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-cream focus-visible:bg-cream"
            >
              <span>
                <span className="block font-medium">{c.name}</span>
                <span className="text-xs text-muted">{[c.city, c.country].filter(Boolean).join(', ')}</span>
              </span>
              <span className="num text-xs text-muted">{c._count.holes}</span>
            </button>
          </li>
        ))}
        {data?.length === 0 && <li className="px-3.5 py-3 text-sm text-muted">{t('noResults')}</li>}
      </ul>
      <Link href="/app/courses/new" className="self-start text-sm underline underline-offset-4">
        {t('addMissing')}
      </Link>
    </div>
  );
}
