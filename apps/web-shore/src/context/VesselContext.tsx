import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.js';

export interface Vessel {
  id: string;
  name: string;
  imoNumber: string | null;
}

interface VesselContextValue {
  companyName: string;
  vessels: Vessel[];
  selectedVesselId: string | null; // null = "all vessels"
  isVesselLocked: boolean; // true when JWT binds the user to one vessel
  setSelectedVesselId: (id: string | null) => void;
  reload: () => void;
}

const VesselContext = createContext<VesselContextValue | null>(null);

const STORAGE_KEY = 'fleetops_selected_vessel';

export function VesselProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVesselId, setSelectedVesselIdState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const isVesselLocked = Boolean(user?.vesselId);

  const load = useCallback(() => {
    if (!user) return;
    api
      .get<{ name: string }>('/tenants/self')
      .then((t) => setCompanyName(t.name))
      .catch(() => {});
    api
      .get<Vessel[]>('/vessels')
      .then((vs) => {
        setVessels(vs);
        if (user.vesselId) {
          // User is bound to one vessel — lock selection
          setSelectedVesselIdState(user.vesselId);
        } else {
          // Restore last selection from localStorage, but only if it still exists
          const stored = localStorage.getItem(STORAGE_KEY);
          const stillExists = stored && vs.some((v) => v.id === stored);
          setSelectedVesselIdState(stillExists ? stored : null);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const setSelectedVesselId = useCallback(
    (id: string | null) => {
      if (isVesselLocked) return; // locked users can't switch
      setSelectedVesselIdState(id);
      if (id) {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    [isVesselLocked],
  );

  if (!loaded && user) {
    // Avoid flash of wrong data; render nothing until vessels are fetched
    return null;
  }

  return (
    <VesselContext.Provider
      value={{
        companyName,
        vessels,
        selectedVesselId,
        isVesselLocked,
        setSelectedVesselId,
        reload: load,
      }}
    >
      {children}
    </VesselContext.Provider>
  );
}

export function useVessel(): VesselContextValue {
  const ctx = useContext(VesselContext);
  if (!ctx) throw new Error('useVessel must be used within VesselProvider');
  return ctx;
}

export function useVesselFilter(): string | undefined {
  const { selectedVesselId } = useVessel();
  return selectedVesselId ?? undefined;
}
