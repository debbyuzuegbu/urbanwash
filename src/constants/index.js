export const ORDER_STATUSES = [
  { key: 'received',      label: 'Received',        icon: '🧺' },
  { key: 'sorting',       label: 'Sorting',         icon: '🗂️' },
  { key: 'washing',       label: 'Washing',         icon: '🫧' },
  { key: 'drying',        label: 'Drying',          icon: '💨' },
  { key: 'ironing',       label: 'Ironing',         icon: '👕' },
  { key: 'ready',         label: 'Ready',           icon: '✅' },
  { key: 'out_delivery',  label: 'Out for Delivery', icon: '🚚' },
  { key: 'completed',     label: 'Completed',       icon: '🎉' },
];

export const LAUNDRY_ITEMS = [
  { id: 'shirt',     label: 'Shirt',      icon: '👔' },
  { id: 'jeans',     label: 'Jeans',      icon: '👖' },
  { id: 'bedsheet',  label: 'Bedsheet',   icon: '🛏️' },
  { id: 'dress',     label: 'Dress',      icon: '👗' },
  { id: 'towel',     label: 'Towel',      icon: '🧣' },
  { id: 'suit',      label: 'Suit',       icon: '🤵' },
];

export const SERVICE_TYPES = [
  { id: 'wash',      label: 'Wash Only' },
  { id: 'dry_clean', label: 'Dry Clean' },
  { id: 'iron',      label: 'Iron Only' },
  { id: 'wash_iron', label: 'Wash & Iron' },
];

export const COLORS = {
  primary:    '#4B3FBE',   // urban. purple
  secondary:  '#3730A3',   // deeper purple
  accent:     '#7C6FD4',   // lighter purple highlight
  success:    '#16A34A',
  warning:    '#D97706',
  danger:     '#DC2626',
  light:      '#F5F4FB',   // very light purple tint
  dark:       '#1A1433',   // near-black purple
  muted:      '#7C6FA0',   // muted purple-grey
  white:      '#FFFFFF',
  border:     '#E5E2F5',   // light purple border
};
