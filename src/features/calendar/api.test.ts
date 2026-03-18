import { mapGoogleEvent } from './mappers';

describe('calendar event mapping', () => {
  it('maps timed events correctly', () => {
    const mapped = mapGoogleEvent({
      id: 'evt-1',
      summary: 'Standup',
      start: { dateTime: '2026-03-18T09:00:00-04:00' },
      end: { dateTime: '2026-03-18T09:30:00-04:00' },
    });

    expect(mapped).toEqual({
      id: 'evt-1',
      summary: 'Standup',
      start: '2026-03-18T09:00:00-04:00',
      end: '2026-03-18T09:30:00-04:00',
      allDay: false,
    });
  });

  it('maps all-day events correctly', () => {
    const mapped = mapGoogleEvent({
      id: 'evt-2',
      summary: 'Company holiday',
      start: { date: '2026-03-18' },
      end: { date: '2026-03-19' },
    });

    expect(mapped).toEqual({
      id: 'evt-2',
      summary: 'Company holiday',
      start: '2026-03-18',
      end: '2026-03-19',
      allDay: true,
    });
  });

  it('falls back summary when missing', () => {
    const mapped = mapGoogleEvent({
      id: 'evt-3',
      start: { dateTime: '2026-03-18T10:00:00-04:00' },
      end: { dateTime: '2026-03-18T11:00:00-04:00' },
    });

    expect(mapped?.summary).toBe('Busy');
  });
});
