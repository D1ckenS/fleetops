import { useState } from 'react';
import { Button, Input, Modal, TextArea } from '@fleetops/ui-kit';
import { api } from '../api/client.js';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormState {
  title: string;
  notes: string;
  totalAmount: string;
  currency: string;
}

const DEFAULT_FORM: FormState = { title: '', notes: '', totalAmount: '0', currency: 'USD' };

export function CreateRequisitionModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleClose = () => {
    setForm(DEFAULT_FORM);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.post('/requisitions', {
        title: form.title.trim(),
        notes: form.notes.trim() || undefined,
        totalAmount: form.totalAmount || '0',
        currency: form.currency.trim() || 'USD',
        requestedAt: new Date().toISOString(),
      });
      setForm(DEFAULT_FORM);
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create requisition.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="New Requisition"
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSubmit}>
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</div>
        )}
        <Input
          id="req-title"
          label="Title *"
          value={form.title}
          onChange={set('title')}
          placeholder="Engine room spares Q3"
          autoFocus
        />
        <TextArea
          id="req-notes"
          label="Notes"
          rows={3}
          value={form.notes}
          onChange={set('notes')}
          placeholder="Additional details..."
        />
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              id="req-amount"
              label="Total Amount"
              type="number"
              min="0"
              step="0.01"
              value={form.totalAmount}
              onChange={set('totalAmount')}
            />
          </div>
          <div className="w-28">
            <Input
              id="req-currency"
              label="Currency"
              value={form.currency}
              onChange={set('currency')}
              placeholder="USD"
              maxLength={3}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
