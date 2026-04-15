import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Navigation from '../components/Navigation';
import ProvidersMap from '../components/ProvidersMap';
import { mockServices } from '../data/mockData';
import { toast } from '../hooks/use-toast';
import { getTranslation } from '../i18n/translations';
import {
  bookAppointment,
  getClientNearbyProviders,
  getMe,
  getMyAppointments,
} from '../api/clientApi';
import {
  getClientSelectedCity,
  setClientSelectedCity,
} from '../utils/clientStorage';
import {
  filterProvidersForService,
  normalizeProviderForMap,
} from '../utils/providerServiceFilter';

const CITY_COORDS = {
  sivakasi: { lat: 9.4524, lng: 77.7958 },
  virudhunagar: { lat: 9.5881, lng: 77.9574 },
};

const CITY_LABELS = {
  sivakasi: 'Sivakasi',
  virudhunagar: 'Virudhunagar',
};

const FALLBACK_CITY = 'sivakasi';
const MAX_ACCEPTABLE_ACCURACY_METERS = 8000;
const ACTIVE_BOOKING_STATUSES = new Set([
  'requested',
  'accepted',
  'on_the_way',
  'in_progress',
]);

const normalizeText = (value) => String(value ?? '').trim().toLowerCase();

const normalizeCityKey = (value) => {
  const cityKey = normalizeText(value);
  return CITY_COORDS[cityKey] ? cityKey : FALLBACK_CITY;
};

const extractErrorMessage = (error) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.code ||
      error.message
    );
  }

  return error instanceof Error ? error.message : 'Something went wrong';
};

const ServiceCategoryPage = ({ lang }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const t = (key) => getTranslation(lang, key);

  const normalizedServiceId = normalizeText(id);
  const serviceMeta = useMemo(
    () => mockServices.find((service) => normalizeText(service.id) === normalizedServiceId),
    [normalizedServiceId]
  );
  const serviceTitle = serviceMeta?.name?.[lang] || id || 'Service';

  const [selectedCity, setSelectedCity] = useState(() =>
    normalizeCityKey(getClientSelectedCity() || FALLBACK_CITY)
  );
  const [useDeviceLocation, setUseDeviceLocation] = useState(true);
  const [locationLabel, setLocationLabel] = useState(CITY_LABELS[selectedCity]);
  const [userLocation, setUserLocation] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [providersError, setProvidersError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [bookingProviderId, setBookingProviderId] = useState(null);
  const [bookedProviderIds, setBookedProviderIds] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [issueDescription, setIssueDescription] = useState('');

  useEffect(() => {
    setClientSelectedCity(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await getMe();
        if (!isMounted) return;

        const userId = String(response?.data?._id || response?.data?.id || '').trim();
        setCurrentUserId(userId);
      } catch (error) {
        if (!isMounted) return;
        setCurrentUserId('');
        console.error('Failed to load current user', error);
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadBookedProviderIds = async () => {
      try {
        const response = await getMyAppointments();
        if (!isMounted) return;

        const items = Array.isArray(response?.data) ? response.data : [];
        const ids = [
          ...new Set(
            items
              .filter((item) => ACTIVE_BOOKING_STATUSES.has(normalizeText(item.status)))
              .map((item) => String(item.providerId || ''))
              .filter(Boolean)
          ),
        ];

        setBookedProviderIds(ids);
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load active bookings', error);
      }
    };

    void loadBookedProviderIds();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProvidersForCoordinates = async (coordinates, nextLocationLabel) => {
      try {
        setLoadingProviders(true);
        setProvidersError('');

        setUserLocation({
          lat: coordinates.lat,
          lng: coordinates.lng,
        });

        const response = await getClientNearbyProviders({
          lat: coordinates.lat,
          lng: coordinates.lng,
          serviceType: normalizedServiceId,
          radiusKm: 50,
          limit: 20,
        });

        if (!isMounted) return;

        const items = Array.isArray(response?.data) ? response.data : [];
        const normalizedProviders = items.map((provider, index) =>
          normalizeProviderForMap(provider, index)
        );
        const filteredProviders = filterProvidersForService({
          providers: normalizedProviders,
          selectedServiceType: normalizedServiceId,
          currentUserId,
        });
        setProviders(filteredProviders);
        setLocationLabel(nextLocationLabel);
      } catch (error) {
        if (!isMounted) return;
        setProviders([]);
        setProvidersError(extractErrorMessage(error));
      } finally {
        if (isMounted) {
          setLoadingProviders(false);
        }
      }
    };

    const fallbackCoordinates = CITY_COORDS[selectedCity];
    const fallbackLocationLabel = CITY_LABELS[selectedCity];

    if (!useDeviceLocation || typeof navigator === 'undefined' || !navigator.geolocation) {
      if (useDeviceLocation && (typeof navigator === 'undefined' || !navigator.geolocation)) {
        setLocationError('Live location unavailable. Showing providers near your selected city.');
      }

      void loadProvidersForCoordinates(fallbackCoordinates, fallbackLocationLabel);

      return () => {
        isMounted = false;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMounted) return;

        const accuracy = Number(position?.coords?.accuracy);
        if (Number.isFinite(accuracy) && accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
          setLocationError(
            'Live location accuracy is low right now. Showing providers near your selected city.'
          );
          setUseDeviceLocation(false);
          void loadProvidersForCoordinates(fallbackCoordinates, fallbackLocationLabel);
          return;
        }

        setLocationError('');

        void loadProvidersForCoordinates(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          'Your current location'
        );
      },
      () => {
        if (!isMounted) return;
        
        // Let's ensure the user explicitly knows we couldn't get their location.
        // It might be blocked or timed out.
        console.warn("Geolocation failed or was blocked by the user.");
        
        setLocationError('Live location unavailable. Showing providers near your selected city.');
        setUseDeviceLocation(false);
        void loadProvidersForCoordinates(fallbackCoordinates, fallbackLocationLabel);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0, // Force a fresh location check
        timeout: 10000,
      }
    );

    return () => {
      isMounted = false;
    };
  }, [currentUserId, normalizedServiceId, selectedCity, serviceTitle, useDeviceLocation]);

  const handleSelectCity = (cityKey) => {
    setSelectedCity(normalizeCityKey(cityKey));
    setUseDeviceLocation(false);
    setLocationError('');
  };

  const handleBookProvider = async (provider, issueText = '') => {
    if (!provider?.id) return;

    setBookingProviderId(provider.id);

    try {
      const response = await bookAppointment({
        providerId: provider.id,
        notes: issueText,
      });

      const persistedProviderId = response?.data?.providerId
        ? String(response.data.providerId)
        : provider.id;

      setBookedProviderIds((currentIds) => [
        ...new Set([...currentIds, provider.id, persistedProviderId]),
      ]);

      toast({
        title: response?.meta?.alreadyBooked ? 'Booking already active' : 'Booking requested',
        description: response?.meta?.alreadyBooked
          ? 'You already have an active booking with this provider.'
          : 'Track status, quotation, payment, and rating from the bookings page.',
      });

      navigate('/bookings', {
        state: response?.data?.id ? { bookingId: String(response.data.id) } : undefined,
      });
    } catch (error) {
      window.alert(extractErrorMessage(error));
    } finally {
      setBookingProviderId(null);
    }
  };

  const openBookingModal = (provider) => {
    if (!provider?.id) return;
    setSelectedProvider(provider);
    setIssueDescription('');
  };

  const closeBookingModal = () => {
    setSelectedProvider(null);
    setIssueDescription('');
  };

  const handleConfirmBooking = async () => {
    const trimmedIssue = issueDescription.trim();
    if (trimmedIssue.length < 20) {
      window.alert('Please describe your issue in at least 2-3 sentences.');
      return;
    }

    if (!selectedProvider) return;

    await handleBookProvider(selectedProvider, trimmedIssue);
    closeBookingModal();
  };

  const averageRating = useMemo(() => {
    if (!providers.length) return 0;
    const total = providers.reduce((sum, provider) => sum + (Number(provider.rating) || 0), 0);
    return Number((total / providers.length).toFixed(1));
  }, [providers]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navigation
        lang={lang}
        onSelectCity={handleSelectCity}
        overrideCity={selectedCity}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <section className="rounded-3xl border border-[#dbeafe] bg-[#edf6ff] p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#0b3d91]">{serviceTitle}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {t('nearbyProviders')} for {locationLabel}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUseDeviceLocation(true)}
              className="rounded-lg border border-[#0b3d91] px-4 py-2 text-sm font-medium text-[#0b3d91] hover:bg-white"
            >
              Use Current Location
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white bg-white p-4">
              <div className="text-xs text-slate-500">Providers Found</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{providers.length}</div>
            </div>
            <div className="rounded-xl border border-white bg-white p-4">
              <div className="text-xs text-slate-500">Average Rating</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {averageRating.toFixed(1)}
              </div>
            </div>
            <div className="rounded-xl border border-white bg-white p-4">
              <div className="text-xs text-slate-500">Booking Flow</div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                Request, quotation, completion, payment, rating
              </div>
            </div>
          </div>

          {locationError ? (
            <p className="mt-4 text-sm text-amber-700">{locationError}</p>
          ) : null}
        </section>

        {!loadingProviders && !providersError && providers.length > 0 ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Nearby providers on map</h2>
              <p className="text-xs text-slate-500">Tap a pin to view and book</p>
            </div>

            <ProvidersMap
              userLocation={userLocation}
              providers={providers}
              bookedProviderIds={bookedProviderIds}
              bookingProviderId={bookingProviderId}
                currentUserId={currentUserId}
                selectedServiceType={normalizedServiceId}
              onBook={openBookingModal}
            />
          </section>
        ) : null}

        <section className="space-y-3">
          {loadingProviders ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
              Loading nearby providers...
            </div>
          ) : null}

          {!loadingProviders && providersError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {providersError}
            </div>
          ) : null}

          {!loadingProviders && !providersError && providers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
              No providers are currently available for this service near {locationLabel}.
            </div>
          ) : null}
        </section>
      </main>

      {selectedProvider ? (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Confirm Booking</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Review provider details and describe your issue before booking.
                </p>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
                onClick={closeBookingModal}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <div className="text-xs text-slate-500">Provider Name</div>
                <div className="text-sm font-semibold text-slate-900">{selectedProvider.name}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Experience</div>
                <div className="text-sm font-semibold text-slate-900">
                  {selectedProvider.experienceYears || 0} years
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Review</div>
                <div className="text-sm font-semibold text-slate-900">
                  {(Number(selectedProvider.rating) || 0).toFixed(1)} ({selectedProvider.totalRatings || 0} ratings)
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Basic Payment</div>
                <div className="text-sm font-semibold text-slate-900">
                  Rs. {Number(selectedProvider.basicPayment || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                The provider&apos;s basic pay is Rs.{' '}
                {Number(selectedProvider.basicPayment || 0).toLocaleString('en-IN')}. The final
                work price will be shared after reviewing your issue. Would you like to continue?
              </p>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="issueDescription">
                Describe your issue
              </label>
              <textarea
                id="issueDescription"
                rows={7}
                value={issueDescription}
                onChange={(event) => setIssueDescription(event.target.value)}
                placeholder="Explain your issue clearly in 6-7 lines so the provider understands the work before accepting."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0b3d91]"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-lg bg-[#0b3d91] px-4 py-2 text-sm font-semibold text-white hover:bg-[#082f72] disabled:opacity-60"
                onClick={handleConfirmBooking}
                disabled={bookingProviderId === selectedProvider.id}
              >
                {bookingProviderId === selectedProvider.id ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav lang={lang} />
    </div>
  );
};

export default ServiceCategoryPage;
