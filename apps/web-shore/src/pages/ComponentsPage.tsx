import { useEffect, useState } from 'react';
import { Badge, Button, Spinner } from '@fleetops/ui-kit';
import { api } from '../api/client.js';
import { CreateComponentModal } from '../components/CreateComponentModal.js';
import { CreateJobModal } from '../components/CreateJobModal.js';
import { CreateJobInstanceModal } from '../components/CreateJobInstanceModal.js';

interface Component {
  id: string;
  name: string;
  description: string | null;
  sfi: string | null;
  parentId: string | null;
  runningHours: string;
}

interface TreeNode extends Component {
  children: TreeNode[];
}

function buildTree(items: Component[]): TreeNode[] {
  const byId = new Map(items.map((c) => [c.id, { ...c, children: [] as TreeNode[] }]));
  const roots: TreeNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) byId.get(node.parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}

interface NodeActions {
  onAddChild: (parentId: string, parentName: string) => void;
  onAddJob: (componentId: string, componentName: string) => void;
}

function ComponentNode({ node, depth, actions }: { node: TreeNode; depth: number; actions: NodeActions }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-slate-100 group"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-slate-400 hover:text-slate-700 w-4 text-xs leading-none"
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-sm font-medium text-slate-800 flex-1">{node.name}</span>
        {node.sfi && <Badge color="blue">{node.sfi}</Badge>}
        <span className="text-xs text-slate-400">{node.runningHours} h</span>
        {/* Action buttons — visible on row hover */}
        <div className="hidden group-hover:flex items-center gap-1 ml-2">
          <button
            onClick={() => actions.onAddJob(node.id, node.name)}
            className="text-xs px-2 py-0.5 rounded border border-slate-300 text-slate-600 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-colors"
            title="Add job to this component"
          >
            + Job
          </button>
          <button
            onClick={() => actions.onAddChild(node.id, node.name)}
            className="text-xs px-2 py-0.5 rounded border border-slate-300 text-slate-600 hover:bg-white hover:border-slate-500 hover:text-slate-800 transition-colors"
            title="Add child component"
          >
            + Child
          </button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <ComponentNode key={child.id} node={child} depth={depth + 1} actions={actions} />
          ))}
        </div>
      )}
    </div>
  );
}

type Modal =
  | { kind: 'none' }
  | { kind: 'component'; parentId?: string; parentName?: string }
  | { kind: 'job'; componentId: string; componentName: string }
  | { kind: 'instance'; jobId: string; componentId: string };

export function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>({ kind: 'none' });

  const load = () => {
    setLoading(true);
    api
      .get<Component[]>('/components')
      .then(setComponents)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const close = () => setModal({ kind: 'none' });

  const actions: NodeActions = {
    onAddChild: (parentId, parentName) => setModal({ kind: 'component', parentId, parentName }),
    onAddJob: (componentId, componentName) => setModal({ kind: 'job', componentId, componentName }),
  };

  const tree = buildTree(components);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Components</h1>
          <p className="text-sm text-slate-500 mt-0.5">Equipment hierarchy for this vessel</p>
        </div>
        <Button onClick={() => setModal({ kind: 'component' })}>+ New Component</Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {loading && <div className="p-8"><Spinner /></div>}
        {error && <div className="p-6 text-sm text-red-600">{error}</div>}
        {!loading && !error && components.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            No components yet.{' '}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setModal({ kind: 'component' })}
            >
              Add the first one.
            </button>
          </div>
        )}
        {!loading && !error && tree.length > 0 && (
          <div className="py-2">
            {tree.map((node) => (
              <ComponentNode key={node.id} node={node} depth={0} actions={actions} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateComponentModal
        open={modal.kind === 'component'}
        parentId={modal.kind === 'component' ? modal.parentId : null}
        parentName={modal.kind === 'component' ? modal.parentName : null}
        onClose={close}
        onCreated={() => { close(); load(); }}
      />
      <CreateJobModal
        open={modal.kind === 'job'}
        componentId={modal.kind === 'job' ? modal.componentId : ''}
        componentName={modal.kind === 'job' ? modal.componentName : ''}
        onClose={close}
        onCreated={(newJobId) => {
          // Jump straight into scheduling an instance for the new job.
          const compId = modal.kind === 'job' ? modal.componentId : '';
          setModal({ kind: 'instance', jobId: newJobId, componentId: compId });
        }}
      />
      <CreateJobInstanceModal
        open={modal.kind === 'instance'}
        jobId={modal.kind === 'instance' ? modal.jobId : null}
        componentId={modal.kind === 'instance' ? modal.componentId : null}
        onClose={close}
        onCreated={() => { close(); load(); }}
      />
    </div>
  );
}
