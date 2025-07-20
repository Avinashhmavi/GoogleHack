"use client";

import { useAuth } from "@/context/auth-context";
import {
  addCalendarEventAction as serverAddCalendarEventAction,
  getCalendarEventsAction as serverGetCalendarEventsAction,
  deleteCalendarEventAction as serverDeleteCalendarEventAction,
} from "./actions";
import type { CalendarEvent } from "./firestore";
import { useCallback } from "react";

// This file creates client-side wrappers for server actions
// that require authentication. This is because we need to access
// the useAuth() hook to get the user's token.

export function useClientActions() {
  const { idToken } = useAuth();

  const authenticatedAction = useCallback(
    async <I, O>(
      action: (token: string | null, input: I) => Promise<O>,
      input: I
    ): Promise<O> => {
      return action(idToken, input);
    },
    [idToken]
  );
  
  const addCalendarEventAction = useCallback((event: Omit<CalendarEvent, 'id' | 'uid'>) => {
    return authenticatedAction(serverAddCalendarEventAction, event);
  }, [authenticatedAction]);

  const getCalendarEventsAction = useCallback(() => {
    return authenticatedAction(serverGetCalendarEventsAction, undefined);
  }, [authenticatedAction]);

  const deleteCalendarEventAction = useCallback((id: string) => {
    return authenticatedAction(serverDeleteCalendarEventAction, id);
  }, [authenticatedAction]);

  return {
    addCalendarEventAction,
    getCalendarEventsAction,
    deleteCalendarEventAction,
  };
}
