import { useUIStore } from '@/store/uiStore';
import { useListingStore } from '@/store/listingStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({ isSidebarOpen: true, isMobileMenuOpen: false, toasts: [] });
  });

  it('toggles sidebar', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(false);
  });

  it('adds and auto-removes a toast', () => {
    vi.useFakeTimers();
    useUIStore.getState().addToast('Hello', 'success');
    expect(useUIStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(5001);
    expect(useUIStore.getState().toasts).toHaveLength(0);
    vi.useRealTimers();
  });
});

describe('listingStore', () => {
  beforeEach(() => useListingStore.getState().resetFilters());

  it('sets a filter value', () => {
    useListingStore.getState().setFilter('city', 'Miami');
    expect(useListingStore.getState().filters.city).toBe('Miami');
  });

  it('resets filters to defaults', () => {
    useListingStore.getState().setFilter('city', 'Miami');
    useListingStore.getState().resetFilters();
    expect(useListingStore.getState().filters.city).toBe('');
  });
});
