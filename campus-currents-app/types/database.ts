// Core database types matching Supabase schema
// Import these in components to ensure type safety

export type UserRole = 'student' | 'admin' | 'super_admin';
export type Level = 'grade_school' | 'junior_high' | 'senior_high' | 'college' | 'law' | 'eteeap';
export type Program = 'BSIT' | 'BSBA' | 'BSA' | 'BSED' | 'BEED' | 'AB_PSYCH' | 'AB_COMM' | 'JD' | 'ETEEAP' | 'STEM' | 'ABM' | 'HUMSS' | 'GAS' | 'TVL' | 'OTHER';

export interface NotificationPreferences {
  general: boolean;
  event: boolean;
  academic: boolean;
}

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  level: Level | null;
  student_id: string | null;
  program: Program | null;
  year_level: number | null;
  section: string | null;
  phone_number: string | null;
  fcm_token: string | null;
  office: string | null;
  can_send_emergency: boolean;
  pin_hash: string | null;
  avatar_url: string | null;
  notification_preferences: NotificationPreferences | null;
  school_id: string;
  created_at: string;
  updated_at: string;
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
  is_deleted: boolean;
  version: number;
  school_id: string;
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export type SuspensionSource = 'manila_lgu' | 'pagasa' | 'deped' | 'school_admin';
export type SuspensionReason = 'weather_flooding' | 'weather_typhoon' | 'lgu_order' | 'facilities' | 'security' | 'other';
export type SuspensionScope = 'all_levels' | 'grade_school_only' | 'k12_only' | 'junior_high_only' | 'senior_high_only' | 'college_only' | 'law_only' | 'specific_programs';
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
  school_id: string;
  created_at: string;
  updated_at: string;
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
  is_deleted: boolean;
  created_by: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export type DeliveryMethod = 'push' | 'sms' | 'both';
export type AcknowledgmentType = 'safe' | 'need_help';

export interface DeliveryReceipt {
  id: string;
  broadcast_id: string;
  student_id: string;
  delivery_method: DeliveryMethod;
  delivered_at: string | null;
  read_at: string | null;
  acknowledged_at: string | null;
  acknowledgment_type: AcknowledgmentType | null;
  created_at: string;
}
