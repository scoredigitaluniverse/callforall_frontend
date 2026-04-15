const toRating = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(1) : '0.0';
};

const toDistance = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `${numericValue.toFixed(1)} km` : 'Nearby';
};

const NearbyProviderCard = ({
  provider,
  isBooked = false,
  isBooking = false,
  onBook,
}) => (
  <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-slate-900 truncate">{provider.name}</h3>
        <p className="text-sm text-slate-600">{provider.serviceLabel || 'Service Provider'}</p>
      </div>

      <button
        type="button"
        onClick={() => onBook(provider)}
        disabled={isBooked || isBooking}
        className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          isBooked
            ? 'bg-green-100 text-green-700 cursor-not-allowed'
            : 'bg-[#0b3d91] text-white hover:bg-[#082f72]'
        }`}
      >
        {isBooked ? 'Booked' : isBooking ? 'Processing...' : 'Book'}
      </button>
    </div>

    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
      <div className="rounded-xl bg-slate-50 px-3 py-2">
        <div className="text-xs text-slate-500">Rating</div>
        <div className="font-semibold text-slate-900">{toRating(provider.rating)}</div>
      </div>
      <div className="rounded-xl bg-slate-50 px-3 py-2">
        <div className="text-xs text-slate-500">Distance</div>
        <div className="font-semibold text-slate-900">{toDistance(provider.distanceKm)}</div>
      </div>
      <div className="rounded-xl bg-slate-50 px-3 py-2">
        <div className="text-xs text-slate-500">Availability</div>
        <div className="font-semibold text-slate-900">
          {isBooked ? 'Already booked' : 'Ready to request'}
        </div>
      </div>
    </div>
  </article>
);

export default NearbyProviderCard;
