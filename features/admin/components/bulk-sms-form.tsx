'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { Chip, FieldLabel } from '@/components/ui/form-controls';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { useBroadcastRecipientsCount } from '../hooks/use-broadcast-recipients-count';
import { useSendBulkSms } from '../hooks/use-send-bulk-sms';

const TEXTAREA_CLASS =
  'w-full px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition resize-none';

function parseList(raw: string): string[] {
  const seen = new Set<string>();
  for (const line of raw.split(/[\n,]/)) {
    const trimmed = line.trim();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen];
}

// Formulaire d'envoi en masse par SMS (voir strImmo/src/broadcast) — même structure que
// BulkEmailForm (hand-copié, pas de composant générique partagé : seule l'absence de champ
// "sujet" et le nom des champs diffèrent). Action coûteuse (un vrai SMS payant par destinataire,
// potentiellement des centaines/milliers) et irréversible une fois partie — confirmation
// obligatoire (window.confirm, même convention que la suppression d'un utilisateur, voir
// admin-user-list-item.tsx) affichant le nombre exact de destinataires avant l'envoi réel.
export function BulkSmsForm() {
  const { t } = useTranslation();
  const [target, setTarget] = useState<'all' | 'custom'>('all');
  const [customList, setCustomList] = useState('');
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: allCount, isLoading: isLoadingCount } = useBroadcastRecipientsCount('sms', target === 'all');
  const { mutate: sendBulkSms, isPending, error, data: result, reset } = useSendBulkSms();

  const customPhones = parseList(customList);
  const recipientsCount = target === 'all' ? allCount : customPhones.length;

  function handleSubmit() {
    if (!message.trim()) {
      setValidationError(t.adminBroadcastPage.validationEmptyMessage);
      return;
    }
    if (target === 'custom' && customPhones.length === 0) {
      setValidationError(t.adminBroadcastPage.validationEmptyRecipients);
      return;
    }
    setValidationError(null);

    const count = target === 'all' ? allCount : customPhones.length;
    if (!window.confirm(`${t.adminBroadcastPage.confirmSendPrefix} ${count ?? '?'} ${t.adminBroadcastPage.recipientsUnit} ?`)) {
      return;
    }

    sendBulkSms({
      target,
      message: message.trim(),
      phones: target === 'custom' ? customPhones : undefined,
    });
  }

  if (result) {
    return (
      <div className="space-y-3">
        <p className="font-semibold text-content-main">{t.adminBroadcastPage.resultTitle}</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-base font-bold text-content-main">{result.total}</div>
            <div className="text-[11px] text-content-muted">{t.adminBroadcastPage.resultTotal}</div>
          </div>
          <div>
            <div className="text-base font-bold text-emerald-600">{result.sent}</div>
            <div className="text-[11px] text-content-muted">{t.adminBroadcastPage.resultSent}</div>
          </div>
          <div>
            <div className="text-base font-bold text-danger">{result.failed}</div>
            <div className="text-[11px] text-content-muted">{t.adminBroadcastPage.resultFailed}</div>
          </div>
        </div>
        {result.failedRecipients.length > 0 && (
          <div>
            <p className="text-[0.85rem] font-semibold text-content-main mb-1">{t.adminBroadcastPage.failedListTitle}</p>
            <p className="text-[0.85rem] text-content-muted break-words">{result.failedRecipients.join(', ')}</p>
          </div>
        )}
        <Button type="button" variant="outline" className="w-full" onClick={() => reset()}>
          {t.adminBroadcastPage.sendAnother}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>{t.adminBroadcastPage.targetLabel}</FieldLabel>
        <div className="flex gap-1.5">
          <Chip active={target === 'all'} onClick={() => setTarget('all')}>
            {t.adminBroadcastPage.targetAll}
          </Chip>
          <Chip active={target === 'custom'} onClick={() => setTarget('custom')}>
            {t.adminBroadcastPage.targetCustom}
          </Chip>
        </div>
      </div>

      {target === 'all' ? (
        <p className="text-[0.85rem] text-content-muted">
          {isLoadingCount ? t.adminBroadcastPage.recipientsCountLoading : `${allCount ?? 0} ${t.adminBroadcastPage.recipientsUnit}`}
        </p>
      ) : (
        <div>
          <FieldLabel>{t.adminBroadcastPage.customListLabel}</FieldLabel>
          <textarea
            value={customList}
            onChange={(event) => setCustomList(event.target.value)}
            placeholder={t.adminBroadcastPage.phonesPlaceholder}
            rows={5}
            className={TEXTAREA_CLASS}
          />
          <p className="text-[0.8rem] text-content-muted mt-1">
            {t.adminBroadcastPage.customListHint} ({customPhones.length} {t.adminBroadcastPage.recipientsUnit})
          </p>
        </div>
      )}

      <div>
        <FieldLabel>{t.adminBroadcastPage.messageLabel}</FieldLabel>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t.adminBroadcastPage.messagePlaceholderSms}
          rows={4}
          className={TEXTAREA_CLASS}
        />
      </div>

      <FormErrorBanner message={validationError ?? (error ? getErrorMessage(error, t.adminBroadcastPage.sendError) : null)} />

      <Button type="button" className="w-full" disabled={isPending || recipientsCount === 0} onClick={handleSubmit}>
        {isPending ? t.adminBroadcastPage.sending : t.adminBroadcastPage.submit}
      </Button>
    </div>
  );
}
