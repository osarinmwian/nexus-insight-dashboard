export const storage = {
  getEvents: () => {
    if (typeof window === 'undefined') return [];
    const events = localStorage.getItem('nexus_events');
    return events ? JSON.parse(events) : [];
  },

  setEvents: (events) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('nexus_events', JSON.stringify(events));
  },

  addEvent: (event) => {
    const events = storage.getEvents();
    events.push(event);
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    storage.setEvents(events);
  },

  clearEvents: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('nexus_events');
  }
};