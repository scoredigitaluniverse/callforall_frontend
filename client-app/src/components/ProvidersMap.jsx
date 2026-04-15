import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const isValidCoordinate = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && Math.abs(numeric) > 0;
};

const normalizeText = (value) => String(value ?? '').trim().toLowerCase();

const toRating = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(1) : '0.0';
};

const DEFAULT_CENTER = {
  lat: 9.4524,
  lng: 77.7958,
};

const createPinIcon = (color) =>
  L.divIcon({
    className: '',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 24 24">
        <path fill="${color}" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
      </svg>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -40],
  });

const USER_ICON = createPinIcon('#0b3d91');
const ACTIVE_PROVIDER_ICON = createPinIcon('#22c55e');
const BOOKED_PROVIDER_ICON = createPinIcon('#16a34a');
const BOOKING_PROVIDER_ICON = createPinIcon('#0b3d91');

const ProvidersMap = ({
  userLocation,
  providers = [],
  bookedProviderIds = [],
  bookingProviderId,
  onBook,
  currentUserId,
  selectedServiceType,
}) => {
  const activeUserId = String(currentUserId || '').trim();
  const selectedServiceKey = normalizeText(selectedServiceType);

  const markers = useMemo(
    () => {
      const seen = new Set();

      return providers
        .filter((provider) => isValidCoordinate(provider.lat) && isValidCoordinate(provider.lng))
        .filter((provider) => {
          const providerUserId = String(provider.providerUserId || provider.user_id || '').trim();

          // Never draw signed-in user as a provider marker.
          if (activeUserId && providerUserId === activeUserId) return false;

          // Final hard category filter at render layer.
          if (!selectedServiceKey) return true;

          const providerServiceType = normalizeText(provider.serviceType || provider.service_type);
          const providerServiceTypeId = normalizeText(provider.serviceTypeId || provider.service_type_id);

          return (
            providerServiceType === selectedServiceKey ||
            providerServiceTypeId === selectedServiceKey
          );
        })
        .filter((provider) => {
          const dedupeKey = String(
            provider.id ||
              provider.providerId ||
              provider.providerUserId ||
              `${provider.lat},${provider.lng}`
          );

          if (seen.has(dedupeKey)) return false;
          seen.add(dedupeKey);
          return true;
        });
    },
    [activeUserId, providers, selectedServiceKey]
  );

  const hasUserLocation =
    userLocation && isValidCoordinate(userLocation.lat) && isValidCoordinate(userLocation.lng);

  const center = useMemo(() => {
    if (hasUserLocation) {
      return [Number(userLocation.lat), Number(userLocation.lng)];
    }

    if (markers.length) {
      const first = markers[0];
      return [Number(first.lat), Number(first.lng)];
    }

    return [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];
  }, [hasUserLocation, markers, userLocation]);

  if (!hasUserLocation && !markers.length) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: 360, width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hasUserLocation ? (
          <Marker
            position={[Number(userLocation.lat), Number(userLocation.lng)]}
            icon={USER_ICON}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-sm font-medium text-slate-900">You are here</div>
            </Popup>
          </Marker>
        ) : null}

        {markers.map((provider) => {
          const isBooked = bookedProviderIds.includes(provider.id);
          const isBooking = bookingProviderId === provider.id;
          const isActive = !isBooked && !isBooking;

          const icon = isBooked
            ? BOOKED_PROVIDER_ICON
            : isBooking
              ? BOOKING_PROVIDER_ICON
              : ACTIVE_PROVIDER_ICON;

          return (
            <Marker
              key={provider.id}
              position={[Number(provider.lat), Number(provider.lng)]}
              icon={icon}
              eventHandlers={{
                // Open popup when hovering the marker. We intentionally
                // do NOT auto-close on mouseout so users can move the
                // cursor into the popup and click "Book now".
                mouseover: (event) => {
                  event.target.openPopup();
                },
              }}
            >
              <Popup>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {provider.name}
                  </div>
                  <div className="text-xs text-slate-600">
                    Rating: {toRating(provider.rating)}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      !isBooked && !isBooking && typeof onBook === 'function' && onBook(provider)
                    }
                    disabled={isBooked || isBooking}
                    className={`mt-1 inline-flex w-full items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      isBooked
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-[#0b3d91] text-white hover:bg-[#082f72]'
                    }`}
                  >
                    {isBooked ? 'Booked' : isBooking ? 'Processing...' : 'Book now'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ProvidersMap;
