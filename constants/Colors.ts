// CampusCurrents Design System Colors
const tintColorLight = '#1E40AF'; // Blue 800 - Primary
const tintColorDark = '#60A5FA'; // Blue 400

export default {
  light: {
    text: '#111827',
    textSecondary: '#6B7280',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    background: '#111827',
    surface: '#1F2937',
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    border: '#374151',
  },
  // Tier colors (shared across themes)
  tier: {
    emergency: '#DC2626',
    important: '#F59E0B',
    routine: '#3B82F6',
  },
  status: {
    on: '#16A34A',        // Classes ON - green
    suspended: '#DC2626', // Suspended - red
    monitoring: '#F59E0B', // Monitoring - amber
  },
  calendar: {
    academic: '#3B82F6',     // Blue
    schoolEvent: '#16A34A',  // Green
    orgActivity: '#8B5CF6',  // Purple
    administrative: '#F97316', // Orange
    holiday: '#DC2626',      // Red
    sports: '#14B8A6',       // Teal
  },
};
