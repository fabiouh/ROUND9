'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { Avatar } from '@/components/app/avatar';
import { PageHeader } from '@/components/app/page-header';
import { EmptyState, ErrorState, Loading, Section } from '@/components/app/states';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { CrewForm } from '@/features/crews/crew-form';
import { useCrew, useCrewMutations } from '@/features/crews/hooks';
import { useMe } from '@/hooks/use-me';
import { InvitePanel } from '@/features/rounds/invite-panel';
import { RoundList } from '@/features/rounds/round-list';
import type { CrewDetail } from '@/lib/types';

export default function CrewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('app.crews');
  const tc = useTranslations('common');
  const q = useCrew(id);
  const me = useMe();
  const m = useCrewMutations(id);
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (q.isPending) return <Loading rows={5} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />;
  const crew: CrewDetail = q.data;
  const canManage = crew.myRole === 'OWNER' || crew.myRole === 'ADMIN';
  const myMember = crew.members.find((x) => x.userId === me.data?.id);

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/app/crews">{t('title')}</Link>}
        title={crew.name}
        description={crew.description ?? tc('members', { count: crew.members.length })}
        actions={
          <>
            <Button asChild>
              <Link href={`/app/rounds/new?crew=${crew.id}`}>
                <Plus aria-hidden /> {t('newRound')}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/app/tournaments/new?crew=${crew.id}`}>{t('newTournament')}</Link>
            </Button>
          </>
        }
      />

      {editing ? (
        <CrewForm crew={crew} onDone={() => setEditing(false)} />
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-12">
            <Section title={t('rounds')}>
              {crew.rounds.length ? (
                <RoundList rounds={crew.rounds} />
              ) : (
                <EmptyState title={t('noRounds')} body={t('noRoundsBody')} />
              )}
            </Section>
            <Section title={t('tournaments')}>
              {crew.tournaments.length ? (
                <ul className="divide-y divide-line border-y border-line">
                  {crew.tournaments.map((tm) => (
                    <li key={tm.id} className="flex items-center justify-between py-3">
                      <Link href={`/app/tournaments/${tm.id}`} className="font-medium hover:underline">{tm.name}</Link>
                      <span className="text-sm text-muted">{tc(`tournamentStatus.${tm.status}`)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">{t('noTournaments')}</p>
              )}
            </Section>
          </div>

          <aside className="flex flex-col gap-10">
            <Section title={`${t('members')} · ${crew.members.length}`}>
              <ul className="flex flex-col">
                {crew.members.map((mem) => {
                  const isMe = mem.userId === me.data?.id;
                  const canRemove = !isMe && mem.role !== 'OWNER' && (crew.myRole === 'OWNER' || (crew.myRole === 'ADMIN' && mem.role === 'MEMBER'));
                  return (
                    <li key={mem.id} className="flex items-center gap-3 border-b border-line py-2.5">
                      <Avatar name={mem.user.displayName} src={mem.user.avatarUrl} className="size-9" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {mem.user.displayName ?? mem.user.username}
                          {isMe && <span className="text-muted"> · {t('you')}</span>}
                        </span>
                        <span className="text-xs text-muted">
                          {tc(`roles.${mem.role}`)}
                          {mem.handicapIndex !== null && ` · HCP ${mem.handicapIndex}`}
                        </span>
                      </span>
                      {crew.myRole === 'OWNER' && mem.role !== 'OWNER' && (
                        <Select
                          aria-label={t('roleFor', { name: mem.user.displayName ?? '' })}
                          className="h-8 w-28 text-xs"
                          value={mem.role}
                          onChange={(e) => m.setRole.mutate({ memberId: mem.id, role: e.target.value as 'ADMIN' | 'MEMBER' })}
                        >
                          <option value="MEMBER">{tc('roles.MEMBER')}</option>
                          <option value="ADMIN">{tc('roles.ADMIN')}</option>
                        </Select>
                      )}
                      {canRemove && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => confirm(t('removeConfirm', { name: mem.user.displayName ?? '' })) && m.removeMember.mutate(mem.id)}
                        >
                          {t('remove')}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>

            {canManage && (
              <Section title={t('invite')}>
                <InvitePanel base={`/crews/${crew.id}`} />
              </Section>
            )}

            <Section title={t('settings')}>
              <div className="flex flex-wrap gap-2">
                {canManage && (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)}>{t('edit')}</Button>
                )}
                {myMember && myMember.role !== 'OWNER' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm(t('leaveConfirm'))) return;
                      await m.removeMember.mutateAsync(myMember.id);
                      router.push('/app/crews');
                    }}
                  >
                    {t('leave')}
                  </Button>
                )}
                {crew.myRole === 'OWNER' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      if (!confirm(t('deleteConfirm'))) return;
                      await m.remove.mutateAsync();
                      router.push('/app/crews');
                    }}
                  >
                    {t('delete')}
                  </Button>
                )}
              </div>
            </Section>
          </aside>
        </div>
      )}
    </>
  );
}
