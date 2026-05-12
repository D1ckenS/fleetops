import { useEffect, useState } from 'react';
import { Badge, type BadgeColor, Spinner } from '@fleetops/ui-kit';
import { api } from '../api/client.js';

interface StockLevelSummary {
  id: string;
  locationId: string;
  locationName: string;
  minStock: string;
  maxStock: string | null;
  reorderPoint: string | null;
  rob: string;
  status: 'green' | 'amber' | 'red' | 'purple';
}

interface PartSummary {
  id: string;
  name: string;
  partNumber: string | null;
  unit: string;
  stockLevels: StockLevelSummary[];
}

const STATUS_COLOR: Record<StockLevelSummary['status'], BadgeColor> = {
  green: 'green',
  amber: 'amber',
  red: 'red',
  purple: 'purple',
};

const STATUS_LABEL: Record<StockLevelSummary['status'], string> = {
  green: 'OK',
  amber: 'Reorder',
  red: 'Low',
  purple: 'Out',
};

function StockChip({ level }: { level: StockLevelSummary }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Badge color={STATUS_COLOR[level.status]}>{STATUS_LABEL[level.status]}</Badge>
      <span className="text-slate-600 font-mono">{parseFloat(level.rob).toFixed(2)}</span>
      <span className="text-slate-400">{level.locationName}</span>
    </div>
  );
}

function PartRow({ part }: { part: PartSummary }) {
  const worstStatus = (['purple', 'red', 'amber', 'green'] as const).find((s) =>
    part.stockLevels.some((l) => l.status === s),
  );

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50">
      <td className="py-3 px-4">
        <div className="font-medium text-slate-800 text-sm">{part.name}</div>
        {part.partNumber && (
          <div className="text-xs text-slate-400 font-mono mt-0.5">{part.partNumber}</div>
        )}
      </td>
      <td className="py-3 px-4 text-xs text-slate-500">{part.unit}</td>
      <td className="py-3 px-4">
        {part.stockLevels.length === 0 ? (
          <span className="text-xs text-slate-400 italic">No stock config</span>
        ) : (
          <div className="space-y-1">
            {part.stockLevels.map((l) => (
              <StockChip key={l.id} level={l} />
            ))}
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        {worstStatus && (
          <Badge color={STATUS_COLOR[worstStatus]}>{STATUS_LABEL[worstStatus]}</Badge>
        )}
      </td>
    </tr>
  );
}

export function InventoryPage() {
  const [parts, setParts] = useState<PartSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => {
    api
      .get<PartSummary[]>('/parts/inventory-summary')
      .then(setParts)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const visible = parts.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'out') return p.stockLevels.some((l) => l.status === 'purple');
    if (filter === 'low')
      return p.stockLevels.some((l) => l.status === 'red' || l.status === 'amber');
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Spare parts &amp; stock levels for this vessel
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'low' ? 'Low / Reorder' : 'Out of stock'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && (
          <div className="p-8 flex justify-center">
            <Spinner />
          </div>
        )}
        {error && <div className="p-6 text-sm text-red-600">{error}</div>}
        {!loading && !error && visible.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            {parts.length === 0
              ? 'No parts configured for this vessel.'
              : 'No parts match the current filter.'}
          </div>
        )}
        {!loading && !error && visible.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="py-3 px-4">Part</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Stock by location</th>
                <th className="py-3 px-4">Overall</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <PartRow key={p.id} part={p} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Badge color="green">OK</Badge> Above reorder point
        </span>
        <span className="flex items-center gap-1">
          <Badge color="amber">Reorder</Badge> Below reorder point
        </span>
        <span className="flex items-center gap-1">
          <Badge color="red">Low</Badge> Below minimum
        </span>
        <span className="flex items-center gap-1">
          <Badge color="purple">Out</Badge> Zero stock
        </span>
      </div>
    </div>
  );
}
