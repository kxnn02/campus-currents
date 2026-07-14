// Core database types matching Supabase schema
// Import these in components to ensure type safety

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  program: string;
  year_level: number;
  section: string;
  phone_number: string | null;
  fcm_token: string | null;
  created_at: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'dept_head' | 'org_officer';
  office: string;
  can_send_emergency: boolean;
  pin_hash: string | null;
  created_at: string;
}

export type NotificationTier = 'routine' | 'important' | 'emergency';
export type SubPriority = 'urgent' | 'standard';
export type BroadcastChannel = 'suspension' | 'event' | 'academic' | 'security' | 'general';

export interface Broadcast {
  id: string;
  sender_id: string;
  tier: NotificationTier;
  sub_priority: SubPriority | null;
  channel: BroadcastChannel;
  title: string;
  body: string;
  target_audience: Record<string, unknown>;
  is_pinned: boolean;
  linked_event_id: string | null;
  linked_suspension_id: string | null;
  sent_at: string;
  created_at: string;
}

export type SuspensionSource = 'manila_lgu' | 'pagasa' | 'deped' | 'school_admin';
export type SuspensionReason = 'weather_flooding' | 'weather_typhoon' | 'lgu_order' | 'facilities' | 'security' | 'other';
export type SuspensionScope = 'all_levels' | 'college_only' | 'specific_programs';
export type SuspensionDuration = 'full_day' | 'am_only' | 'pm_only';
export type SuspensionStatus = 'active' | 'lifted';

export interface ClassSuspension {
  id: string;
  declared_by: string;
  source: SuspensionSource;
  reason: SuspensionReason;
  scope: SuspensionScope;
  scope_detail: Record<string, unknown> | null;
  duration: SuspensionDuration;
  suspension_date: string;
  status: SuspensionStatus;
  broadcast_id: string | null;
  created_at: string;
}

export type EventCategory = 'academic' | 'school_event' | 'org_activity' | 'administrative' | 'holiday' | 'sports' | 'seminar';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  start_date: string;
  end_date: string;
  is_all_day: boolean;
  location: string | null;
  organizer_name: string;
  target_audience: Record<string, unknown>;
  attachment_url: string | null;
  status: 'active' | 'cancelled';
  created_by: string;
  created_at: string;
}

export type AcknowledgmentType = 'safe' | 'need_help';

export interface DeliveryReceipt {
  id: string;
  broadcast_id: string;
  student_id: string;
  delivered_at: string | null;
  read_at: string | null;
  acknowledged_at: string | null;
  acknowledgment_type: AcknowledgmentType | null;
  created_at: string;
}
