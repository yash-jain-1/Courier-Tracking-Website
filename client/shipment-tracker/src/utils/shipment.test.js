import {
  formatStatus,
  formatUpdateDateTime,
  getProgress,
  normalizeTrackingNumber,
  sortUpdatesNewestFirst,
} from './shipment';

describe('normalizeTrackingNumber', () => {
  it('trims and uppercases', () => {
    expect(normalizeTrackingNumber('  sh2025001 ')).toBe('SH2025001');
    expect(normalizeTrackingNumber(null)).toBe('');
  });
});

describe('formatStatus', () => {
  it('maps known statuses to labels and keeps legacy free text', () => {
    expect(formatStatus('in transit')).toBe('In Transit');
    expect(formatStatus('DELIVERED')).toBe('Delivered');
    expect(formatStatus('Package Delivered')).toBe('Package Delivered');
  });
});

describe('sortUpdatesNewestFirst', () => {
  it('sorts by date, using insertion order for ties', () => {
    const updates = [
      { status: 'a', date: '2025-01-02T10:00:00Z' },
      { status: 'b', date: '2025-01-01T10:00:00Z' }, // back-dated, inserted later
      { status: 'c', date: '2025-01-02T10:00:00Z' },
    ];
    expect(sortUpdatesNewestFirst(updates).map((u) => u.status)).toEqual(['c', 'a', 'b']);
  });
});

describe('getProgress', () => {
  it('maps milestones to evenly spaced values', () => {
    expect(getProgress({ status: 'processing' }).value).toBe(0);
    expect(getProgress({ status: 'in transit' }).value).toBe(50);
    expect(getProgress({ status: 'Delivered' }).value).toBe(100);
  });

  it('keeps the last reached milestone when delayed', () => {
    const progress = getProgress({
      status: 'delayed',
      updates: [
        { status: 'picked up', date: '2025-01-01T10:00:00Z' },
        { status: 'in transit', date: '2025-01-02T10:00:00Z' },
        { status: 'delayed', date: '2025-01-03T10:00:00Z' },
      ],
    });
    expect(progress).toEqual({ stepIndex: 2, value: 50, isDelayed: true });
  });
});

describe('formatUpdateDateTime', () => {
  it('shows legacy date-only entries on the calendar day they were entered', () => {
    expect(formatUpdateDateTime({ date: '2025-01-20T00:00:00.000Z', time: '10:30 AM' }))
      .toEqual({ date: '20 Jan 2025', time: '10:30 AM' });
  });
});
