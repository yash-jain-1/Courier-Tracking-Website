import { FaTruck, FaBoxOpen, FaShippingFast, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

// Must match STATUSES in server/utils/shipment.js
export const STATUS_OPTIONS = [
  { value: 'processing', label: 'Processing' },
  { value: 'picked up', label: 'Picked Up' },
  { value: 'in transit', label: 'In Transit' },
  { value: 'out for delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'delayed', label: 'Delayed' },
];

// Ordered delivery milestones shown on the progress bar
export const PROGRESS_STEPS = STATUS_OPTIONS.filter(({ value }) => value !== 'delayed');

const stepIndexOf = (status) =>
  PROGRESS_STEPS.findIndex(({ value }) => value === String(status ?? '').trim().toLowerCase());

export const normalizeTrackingNumber = (value) => String(value ?? '').trim().toUpperCase();

export const formatStatus = (status) => {
  const option = STATUS_OPTIONS.find(({ value }) => value === String(status ?? '').trim().toLowerCase());
  return option ? option.label : status || 'Unknown';
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'green';
    case 'in transit':
    case 'out for delivery':
      return 'blue';
    case 'picked up':
    case 'processing':
      return 'orange';
    case 'delayed':
      return 'red';
    default:
      return 'gray';
  }
};

export const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return FaCheckCircle;
    case 'in transit':
    case 'out for delivery':
      return FaShippingFast;
    case 'picked up':
    case 'processing':
      return FaBoxOpen;
    case 'delayed':
      return FaExclamationTriangle;
    default:
      return FaTruck;
  }
};

// Event times are entered with minute precision, so compare at that precision
const toMinute = (date) => Math.floor(new Date(date).getTime() / 60000);

// Newest first by event time; insertion order breaks ties (later insert = newer).
// Must match getLatestUpdateIndex in server/utils/shipment.js
export const sortUpdatesNewestFirst = (updates = []) =>
  updates
    .map((update, index) => ({ update, index }))
    .sort((a, b) => {
      const diff = toMinute(b.update.date) - toMinute(a.update.date);
      return diff !== 0 && !Number.isNaN(diff) ? diff : b.index - a.index;
    })
    .map(({ update }) => update);

// Current milestone for the progress bar. Delayed/unknown statuses fall back to the
// most recent milestone reached in the timeline.
export const getProgress = (shipment) => {
  let stepIndex = stepIndexOf(shipment?.status);
  if (stepIndex === -1) {
    const reached = sortUpdatesNewestFirst(shipment?.updates).find(
      (update) => stepIndexOf(update.status) !== -1
    );
    stepIndex = reached ? stepIndexOf(reached.status) : 0;
  }
  return {
    stepIndex,
    value: (stepIndex / (PROGRESS_STEPS.length - 1)) * 100,
    isDelayed: shipment?.status?.toLowerCase() === 'delayed',
  };
};

// Legacy records never updated `location` after creation, so prefer the latest event's location
export const getCurrentLocation = (shipment) =>
  sortUpdatesNewestFirst(shipment?.updates)[0]?.location || shipment?.location;

const isValidDate = (date) => !Number.isNaN(date.getTime());

/**
 * Date and time labels for a timeline entry. Legacy entries stored a date-only value
 * (UTC midnight) plus a separate `time` string, so their date is shown in UTC to keep
 * the calendar day as entered.
 */
export const formatUpdateDateTime = (update) => {
  const date = new Date(update.date);
  if (!isValidDate(date)) return { date: 'N/A', time: update.time || '' };

  if (update.time) {
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }),
      time: update.time,
    };
  }
  return {
    date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
};

export const formatDateTime = (value) => {
  const date = new Date(value);
  return !value || !isValidDate(date)
    ? 'N/A'
    : date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
};

// Value for <input type="datetime-local"> in the browser's local timezone
export const toDateTimeLocalValue = (date = new Date()) => {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};
