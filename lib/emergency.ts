import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { recordAcknowledgment, queueReceipt } from '@/lib/receipts';
import { AcknowledgmentType } from '@/types/database';

// --- Types ---

export interface ActiveEmergency {
  id: string;
  broadcast_id: string;
  emergency_type: 'active_threat' | 'fire' | 'earthquake' | 'flooding';
  status: 'active' | 'resolved';
  created_at: string;
  resolved_at: string | null;
}

export interface EmergencyState {
  activeEmergency: ActiveEmergency | null;
  hasAcknowledged: boolean;
  acknowledgmentType: AcknowledgmentType | null;
  showOverlay: boolean;
}

interface EmergencyContextValue extends EmergencyState {
  acknowledge: (type: AcknowledgmentType) => Promise<void>;
  checkActiveEmergency: () => Promise<void>;
}

// --- Constants ---

const ACK_STORAGE_KEY_PREFIX = '@campus_currents:emergency_ack_';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

// --- Helpers ---

function getAckStorageKey(emergencyId: string): string {
  return `${ACK_STORAGE_KEY_PREFIX}${emergencyId}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Context ---

const EmergencyContext = createContext<EmergencyContextValue | undefined>(undefined);

// --- Provider ---

export function EmergencyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EmergencyState>({
    activeEmergency: null,
    hasAcknowledged: false,
    acknowledgmentType: null,
    showOverlay: false,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  /**
   * Check for an active emergency in the database.
   * If found and the student hasn't acknowledged, show the overlay.
   */
  const checkActiveEmergency = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('active_emergencies')
        .select('*')
        .eq('status', 'active')
        .limit(1)
        .single();

      if (error || !data) {
        // No active emergency — clear state
        setState((prev) => ({
          ...prev,
          activeEmergency: null,
          showOverlay: false,
        }));
        return;
      }

      const emergency = data as ActiveEmergency;

      // Check if student already acknowledged this emergency (persisted in AsyncStorage)
      const ackData = await AsyncStorage.getItem(getAckStorageKey(emergency.id));

      if (ackData) {
        const parsed = JSON.parse(ackData) as { type: AcknowledgmentType };
        setState({
          activeEmergency: emergency,
          hasAcknowledged: true,
          acknowledgmentType: parsed.type,
          showOverlay: false,
        });
      } else {
        setState({
          activeEmergency: emergency,
          hasAcknowledged: false,
          acknowledgmentType: null,
          showOverlay: true,
        });
      }
    } catch {
      // Silently fail — don't crash the app if emergency check fails
    }
  }, []);

  /**
   * Acknowledge the active emergency.
   * Writes delivery_receipt with retries (3x exponential backoff).
   * On total failure: queues locally, dismisses overlay, shows toast.
   */
  const acknowledge = useCallback(
    async (type: AcknowledgmentType) => {
      const emergency = stateRef.current.activeEmergency;
      if (!emergency) return;

      // Get the current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const studentId = sessionData?.session?.user?.id;
      if (!studentId) return;

      let success = false;

      // Retry up to 3 times with exponential backoff (1s, 2s, 4s)
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await recordAcknowledgment(emergency.broadcast_id, studentId, type);
          success = true;
          break;
        } catch {
          if (attempt < MAX_RETRIES - 1) {
            await delay(BASE_DELAY_MS * Math.pow(2, attempt));
          }
        }
      }

      if (!success) {
        // All retries failed — queue locally
        await queueReceipt({
          broadcast_id: emergency.broadcast_id,
          student_id: studentId,
          type: 'acknowledgment',
          acknowledgment_type: type,
          timestamp: new Date().toISOString(),
        });

        // Persist acknowledgment locally so overlay doesn't reappear
        await AsyncStorage.setItem(
          getAckStorageKey(emergency.id),
          JSON.stringify({ type })
        );

        // Dismiss overlay — toast is handled by the UI layer
        setState((prev) => ({
          ...prev,
          hasAcknowledged: true,
          acknowledgmentType: type,
          showOverlay: false,
        }));
        return;
      }

      // Success — persist acknowledgment and dismiss overlay
      await AsyncStorage.setItem(
        getAckStorageKey(emergency.id),
        JSON.stringify({ type })
      );

      setState((prev) => ({
        ...prev,
        hasAcknowledged: true,
        acknowledgmentType: type,
        showOverlay: false,
      }));
    },
    []
  );

  // On mount: check for active emergency
  useEffect(() => {
    checkActiveEmergency();
  }, [checkActiveEmergency]);

  const contextValue: EmergencyContextValue = {
    ...state,
    acknowledge,
    checkActiveEmergency,
  };

  return React.createElement(
    EmergencyContext.Provider,
    { value: contextValue },
    children
  );
}

// --- Hook ---

/**
 * Access emergency state and actions.
 * Must be used within an EmergencyProvider.
 */
export function useEmergency(): EmergencyContextValue {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
