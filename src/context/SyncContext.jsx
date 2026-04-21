import React, { createContext, useContext, useEffect, useState } from 'react';
import { localDb } from '../utils/localDb';
import { billsApi } from '../api/client';
import { useSession } from '@descope/react-sdk';

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const { sessionToken } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Check pending count on mount and after sync
  const updatePendingCount = async () => {
    const pending = await localDb.getPendingBills();
    setPendingCount(pending.length);
  };

  const syncNow = async () => {
    if (!sessionToken || isSyncing) return;
    
    const pending = await localDb.getPendingBills();
    if (pending.length === 0) return;

    setIsSyncing(true);
    console.log(`[Sync] Starting sync for ${pending.length} bills...`);

    for (const bill of pending) {
      try {
        const { tempId, businessId, ...billData } = bill;
        await billsApi.create(businessId, billData, sessionToken);
        // Successful sync, remove from local queue
        await localDb.removePendingBill(tempId);
      } catch (err) {
        console.error(`[Sync] Failed to sync bill ${bill.tempId}:`, err.message);
        // If it's a specific "Business Expired" or Auth error, we might want to stop
        if (err.message.includes('expired') || err.message.includes('401')) break;
      }
    }

    setIsSyncing(false);
    updatePendingCount();
  };

  // Sync Interval (Every 15 minutes = 15 * 60 * 1000)
  useEffect(() => {
    updatePendingCount();
    
    // Initial sync attempt
    if (sessionToken) syncNow();

    const interval = setInterval(() => {
      syncNow();
    }, 15 * 60 * 1000); 

    return () => clearInterval(interval);
  }, [sessionToken]);

  return (
    <SyncContext.Provider value={{ isSyncing, pendingCount, syncNow, updatePendingCount }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);
