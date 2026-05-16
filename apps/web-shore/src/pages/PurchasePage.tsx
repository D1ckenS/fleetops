import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, type BadgeColor, Button, Spinner } from '@fleetops/ui-kit';
import { api } from '../api/client.js';
import { CreateRequisitionModal } from '../components/CreateRequisitionModal.js';
import { CreatePurchaseOrderModal } from '../components/CreatePurchaseOrderModal.js';
import { CreateSupplierModal } from '../components/CreateSupplierModal.js';
import { EditSupplierModal } from '../components/EditSupplierModal.js';
import { PODetailModal } from '../components/PODetailModal.js';
import { RejectRequisitionModal } from '../components/RejectRequisitionModal.js';

// --- Shared types ---
export type ReqStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type POStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACKNOWLEDGED'
  | 'IN_TRANSIT'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED'
  | 'CLOSED';

export interface RequisitionLine {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  estimatedUnitPrice: string | null;
  estimatedTotalPrice: string | null;
  currency: string | null;
}

export interface Requisition {
  id: string;
  title: string;
  notes: string | null;
  status: ReqStatus;
  totalAmount: string;
  currency: string;
  requestedAt: string;
  rejectionReason: string | null;
  lines: RequisitionLine[];
}

export interface POLine {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  totalPrice: string;
  currency: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface GoodsReceiptLine {
  id: string;
  poLineId: string;
  description: string;
  quantityOrdered: string;
  quantityReceived: string;
  unit: string;
}

export interface GoodsReceipt {
  id: string;
  receivedAt: string;
  notes: string | null;
  lines: GoodsReceiptLine[];
}

export interface PurchaseOrder {
  id: string;
  title: string;
  notes: string | null;
  status: POStatus;
  poNumber: string | null;
  totalAmount: string;
  currency: string;
  supplierId: string | null;
  supplier: Supplier | null;
  requisitionId: string | null;
  expectedDeliveryAt: string | null;
  createdAt: string;
  lines: POLine[];
  receipts?: GoodsReceipt[];
}

// --- Helpers ---
const titleCase = (s: string) =>
  s
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const fmtAmount = (amount: string, currency: string) =>
  `${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;

const REQ_STATUS_COLOR: Record<ReqStatus, BadgeColor> = {
  DRAFT: 'slate',
  SUBMITTED: 'amber',
  APPROVED: 'green',
  REJECTED: 'red',
};

const PO_STATUS_COLOR: Record<POStatus, BadgeColor> = {
  DRAFT: 'slate',
  SENT: 'blue',
  ACKNOWLEDGED: 'blue',
  IN_TRANSIT: 'amber',
  PARTIALLY_RECEIVED: 'amber',
  RECEIVED: 'green',
  CANCELLED: 'red',
  CLOSED: 'slate',
};

// --- Chip button ---
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={
        active
          ? { background: 'var(--navy)', color: '#fff' }
          : {
              background: 'var(--surface-2)',
              color: 'var(--ink-2)',
              border: '1px solid var(--border)',
            }
      }
      className="px-3 py-1.5 rounded-2 text-xs font-medium transition-colors"
    >
      {children}
    </button>
  );
}

// --- Requisitions Tab ---
const REQ_FILTERS = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const;
type ReqFilter = (typeof REQ_FILTERS)[number];

function RequisitionsTab() {
  const [reqs, setReqs] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReqFilter>('ALL');
  const [creating, setCreating] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [createPoTarget, setCreatePoTarget] = useState<{ id: string; title: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const url = filter === 'ALL' ? '/requisitions' : `/requisitions?status=${filter}`;
    api
      .get<Requisition[]>(url)
      .then(setReqs)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = async (id: string, action: 'submit' | 'approve') => {
    setActionLoading(`${id}-${action}`);
    try {
      await api.post(`/requisitions/${id}/${action}`, {});
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {REQ_FILTERS.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === 'ALL' ? 'All' : titleCase(f)}
            </Chip>
          ))}
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          + New Requisition
        </Button>
      </div>

      {/* Table card */}
      <div
        className="overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-3)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        {loading && (
          <div className="p-8 flex justify-center">
            <Spinner />
          </div>
        )}
        {error && (
          <div className="p-6 text-xs" style={{ color: 'var(--sig-red)' }}>
            {error}
          </div>
        )}
        {!loading && !error && reqs.length === 0 && (
          <div className="p-10 text-center text-xs" style={{ color: 'var(--ink-3)' }}>
            No requisitions found. Create one to get started.
          </div>
        )}
        {!loading && !error && reqs.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr
                className="text-xs font-semibold uppercase tracking-wide"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--ink-3)',
                  borderBottom: '1px solid var(--hairline)',
                }}
              >
                <th className="py-2.5 px-4">Title</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Requested</th>
                <th className="py-2.5 px-4">Lines</th>
                <th className="py-2.5 px-4" />
              </tr>
            </thead>
            <tbody>
              {reqs.map((r) => (
                <>
                  <tr
                    key={r.id}
                    className="transition-colors cursor-pointer"
                    style={{ borderTop: '1px solid var(--hairline)' }}
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                        {r.title}
                      </div>
                      {r.rejectionReason && (
                        <div className="text-xs mt-0.5" style={{ color: 'var(--sig-red)' }}>
                          {r.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge color={REQ_STATUS_COLOR[r.status]}>{titleCase(r.status)}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono" style={{ color: 'var(--ink-2)' }}>
                      {fmtAmount(r.totalAmount, r.currency)}
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--ink-3)' }}>
                      {fmtDate(r.requestedAt)}
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--ink-3)' }}>
                      {r.lines.length}
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 justify-end">
                        {r.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={actionLoading === `${r.id}-submit`}
                            onClick={() => doAction(r.id, 'submit')}
                          >
                            Submit
                          </Button>
                        )}
                        {r.status === 'SUBMITTED' && (
                          <>
                            <Button
                              size="sm"
                              loading={actionLoading === `${r.id}-approve`}
                              onClick={() => doAction(r.id, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setRejectTarget(r.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {r.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            onClick={() => setCreatePoTarget({ id: r.id, title: r.title })}
                          >
                            Create PO
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === r.id && r.lines.length > 0 && (
                    <tr
                      key={`${r.id}-lines`}
                      style={{
                        background: 'var(--surface-2)',
                        borderTop: '1px solid var(--hairline)',
                      }}
                    >
                      <td colSpan={6} className="px-6 py-3">
                        <div
                          className="text-xs font-semibold mb-2"
                          style={{ color: 'var(--ink-3)' }}
                        >
                          LINE ITEMS
                        </div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ color: 'var(--ink-3)' }}>
                              <th className="text-left pb-1.5 font-medium">Description</th>
                              <th className="text-right pb-1.5 font-medium">Qty</th>
                              <th className="text-right pb-1.5 font-medium">Unit</th>
                              <th className="text-right pb-1.5 font-medium">Est. Unit Price</th>
                              <th className="text-right pb-1.5 font-medium">Est. Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.lines.map((l) => (
                              <tr
                                key={l.id}
                                style={{
                                  borderTop: '1px solid var(--hairline)',
                                  color: 'var(--ink-2)',
                                }}
                              >
                                <td className="py-1.5 pr-4">{l.description}</td>
                                <td className="py-1.5 text-right font-mono">
                                  {parseFloat(l.quantity).toLocaleString()}
                                </td>
                                <td className="py-1.5 text-right">{l.unit}</td>
                                <td className="py-1.5 text-right font-mono">
                                  {l.estimatedUnitPrice
                                    ? `${parseFloat(l.estimatedUnitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${l.currency ?? ''}`
                                    : '—'}
                                </td>
                                <td
                                  className="py-1.5 text-right font-mono"
                                  style={{ color: 'var(--ink)' }}
                                >
                                  {l.estimatedTotalPrice
                                    ? `${parseFloat(l.estimatedTotalPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${l.currency ?? ''}`
                                    : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateRequisitionModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={() => {
          setCreating(false);
          load();
        }}
      />
      <RejectRequisitionModal
        requisitionId={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onRejected={() => {
          setRejectTarget(null);
          load();
        }}
      />
      <CreatePurchaseOrderModal
        open={createPoTarget !== null}
        requisitionId={createPoTarget?.id ?? ''}
        requisitionTitle={createPoTarget?.title ?? ''}
        onClose={() => setCreatePoTarget(null)}
        onCreated={() => {
          setCreatePoTarget(null);
          load();
        }}
      />
    </div>
  );
}

// --- Suppliers Tab ---
interface SupplierFull {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string | null;
  isActive: boolean;
}

function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<SupplierFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SupplierFull | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<SupplierFull[]>('/suppliers')
      .then(setSuppliers)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete supplier "${name}"?`)) return;
    try {
      await api.delete(`/suppliers/${id}`);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--ink-3)' }}>
          Vendors available when creating purchase orders.
        </p>
        <Button size="sm" onClick={() => setCreating(true)}>
          + New Supplier
        </Button>
      </div>

      <div
        className="overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-3)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        {loading && (
          <div className="p-8 flex justify-center">
            <Spinner />
          </div>
        )}
        {error && (
          <div className="p-6 text-xs" style={{ color: 'var(--sig-red)' }}>
            {error}
          </div>
        )}
        {!loading && !error && suppliers.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-xs mb-2" style={{ color: 'var(--ink-3)' }}>
              No suppliers yet.
            </p>
            <button
              className="text-xs font-medium underline"
              style={{ color: 'var(--sig-blue)' }}
              onClick={() => setCreating(true)}
            >
              Add the first one
            </button>
          </div>
        )}
        {!loading && !error && suppliers.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr
                className="text-xs font-semibold uppercase tracking-wide"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--ink-3)',
                  borderBottom: '1px solid var(--hairline)',
                }}
              >
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Contact</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Phone</th>
                <th className="py-2.5 px-4">Country</th>
                <th className="py-2.5 px-4" />
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr
                  key={s.id}
                  className="group transition-colors"
                  style={{ borderTop: '1px solid var(--hairline)' }}
                >
                  <td className="py-3 px-4 font-medium" style={{ color: 'var(--ink)' }}>
                    {s.name}
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--ink-2)' }}>
                    {s.contactName ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--ink-2)' }}>
                    {s.contactEmail ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--ink-2)' }}>
                    {s.contactPhone ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--ink-3)' }}>
                    {s.country ?? '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-xs font-medium"
                        style={{ color: 'var(--ink-2)' }}
                        onClick={() => setEditing(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs font-medium"
                        style={{ color: 'var(--sig-red)' }}
                        onClick={() => handleDelete(s.id, s.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateSupplierModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={() => {
          setCreating(false);
          load();
        }}
      />
      {editing && (
        <EditSupplierModal
          supplier={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// --- Purchase Orders Tab ---
const PO_FILTERS = [
  'ALL',
  'DRAFT',
  'SENT',
  'IN_TRANSIT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
] as const;
type POFilter = (typeof PO_FILTERS)[number];

const canReceive = (s: POStatus) =>
  (['SENT', 'ACKNOWLEDGED', 'IN_TRANSIT', 'PARTIALLY_RECEIVED'] as POStatus[]).includes(s);

function PurchaseOrdersTab() {
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<POFilter>('ALL');
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const url = filter === 'ALL' ? '/purchase-orders' : `/purchase-orders?status=${filter}`;
    api
      .get<PurchaseOrder[]>(url)
      .then(setPOs)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const sendPO = async (po: PurchaseOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!po.supplierId) {
      alert('A supplier must be set before sending a purchase order.');
      return;
    }
    setActionLoading(po.id);
    try {
      await api.post(`/purchase-orders/${po.id}/send`, {});
      load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setActionLoading(null);
    }
  };

  const openDetail = async (po: PurchaseOrder) => {
    try {
      const detail = await api.get<PurchaseOrder>(`/purchase-orders/${po.id}`);
      setSelected(detail);
    } catch {
      setSelected(po);
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-2 flex-wrap">
        {PO_FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'All' : titleCase(f)}
          </Chip>
        ))}
      </div>

      <div
        className="overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-3)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        {loading && (
          <div className="p-8 flex justify-center">
            <Spinner />
          </div>
        )}
        {error && (
          <div className="p-6 text-xs" style={{ color: 'var(--sig-red)' }}>
            {error}
          </div>
        )}
        {!loading && !error && pos.length === 0 && (
          <div className="p-10 text-center text-xs" style={{ color: 'var(--ink-3)' }}>
            No purchase orders found.
          </div>
        )}
        {!loading && !error && pos.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr
                className="text-xs font-semibold uppercase tracking-wide"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--ink-3)',
                  borderBottom: '1px solid var(--hairline)',
                }}
              >
                <th className="py-2.5 px-4">Title / PO#</th>
                <th className="py-2.5 px-4">Supplier</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Expected</th>
                <th className="py-2.5 px-4" />
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => (
                <tr
                  key={po.id}
                  className="transition-colors cursor-pointer hover:bg-surface-sunk"
                  style={{ borderTop: '1px solid var(--hairline)' }}
                  onClick={() => openDetail(po)}
                >
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                      {po.title}
                    </div>
                    {po.poNumber && (
                      <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--ink-4)' }}>
                        {po.poNumber}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--ink-2)' }}>
                    {po.supplier ? (
                      po.supplier.name
                    ) : (
                      <span style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>Not set</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge color={PO_STATUS_COLOR[po.status]}>{titleCase(po.status)}</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm font-mono" style={{ color: 'var(--ink-2)' }}>
                    {fmtAmount(po.totalAmount, po.currency)}
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--ink-3)' }}>
                    {po.expectedDeliveryAt ? fmtDate(po.expectedDeliveryAt) : '—'}
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 justify-end">
                      {po.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          loading={actionLoading === po.id}
                          onClick={(e) => sendPO(po, e)}
                        >
                          Send
                        </Button>
                      )}
                      {canReceive(po.status) && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(po);
                          }}
                        >
                          Receive
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <PODetailModal
          po={selected}
          onClose={() => setSelected(null)}
          onGrnPosted={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// --- Main Page ---
type Tab = 'requisitions' | 'purchase-orders' | 'suppliers';

const TABS: { id: Tab; label: string }[] = [
  { id: 'requisitions', label: 'Requisitions' },
  { id: 'purchase-orders', label: 'Purchase Orders' },
  { id: 'suppliers', label: 'Suppliers' },
];

export function PurchasePage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab | null) ?? 'requisitions';

  const setTab = (t: Tab) => {
    setParams(t === 'requisitions' ? {} : { tab: t });
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>
          Purchase
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--ink-3)' }}>
          Requisitions, purchase orders &amp; suppliers
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 mb-5" style={{ borderBottom: '1px solid var(--hairline)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2.5 text-xs font-medium border-b-2 transition-colors"
            style={
              tab === t.id
                ? {
                    borderBottomColor: 'var(--navy)',
                    color: 'var(--navy)',
                    marginBottom: '-1px',
                  }
                : {
                    borderBottomColor: 'transparent',
                    color: 'var(--ink-3)',
                  }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'requisitions' && <RequisitionsTab />}
      {tab === 'purchase-orders' && <PurchaseOrdersTab />}
      {tab === 'suppliers' && <SuppliersTab />}
    </div>
  );
}
