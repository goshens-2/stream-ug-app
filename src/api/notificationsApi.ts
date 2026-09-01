/**
 * Notification data access, e.g. alerting a user their requested content is
 * now available. Reads/writes Supabase when configured; otherwise falls
 * back to the in-memory mock data.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { notifications as mockNotifications } from '../data/mockData';
import type { Notification } from '../types';
import { mapNotificationRow, type NotificationRow } from './mappers';

export async function fetchNotifications(): Promise<Notification[]> {
  if (!isSupabaseConfigured) return mockNotifications;

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as NotificationRow[]).map(mapNotificationRow);
}

export type NewNotification = Pick<Notification, 'userId' | 'type' | 'message' | 'contentId'>;

export async function insertNotification(notification: NewNotification): Promise<Notification> {
  if (!isSupabaseConfigured) {
    return {
      id: `notif-${Date.now()}`,
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.userId,
      type: notification.type,
      message: notification.message,
      content_id: notification.contentId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapNotificationRow(data as NotificationRow);
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}
