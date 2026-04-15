const normalizeText = (value) => String(value ?? '').trim().toLowerCase();

const toSafeString = (value) => String(value ?? '').trim();

const toFirstValidNumber = (...values) => {
  for (const value of values) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }

  return 0;
};

export const normalizeProviderForMap = (provider, index = 0) => ({
  id: toSafeString(provider.providerId || provider.id || `provider-${index}`),
  providerUserId: toSafeString(provider.providerUserId || provider.user_id),
  name: toSafeString(provider.name) || 'Service Provider',
  rating: toFirstValidNumber(provider.rating, provider.overall_rating, provider.avg_rating),
  totalRatings: toFirstValidNumber(
    provider.total_ratings,
    provider.totalRatings,
    provider.total_ratings_count,
    provider.reviewCount
  ),
  experienceYears: toFirstValidNumber(
    provider.experience_years,
    provider.experienceYears,
    provider.experience
  ),
  basicPayment: toFirstValidNumber(
    provider.basicPayment,
    provider.basic_payment,
    provider.basePayment,
    provider.user_basic_payment
  ),
  distanceKm: Number.isFinite(Number(provider.distance)) ? Number(provider.distance) : null,
  serviceType: toSafeString(provider.service_type),
  serviceTypeId: toSafeString(provider.service_type_id),
  lat: Number.isFinite(Number(provider.lat ?? provider.latitude))
    ? Number(provider.lat ?? provider.latitude)
    : null,
  lng: Number.isFinite(Number(provider.lng ?? provider.longitude))
    ? Number(provider.lng ?? provider.longitude)
    : null,
});

export const filterProvidersForService = ({ providers = [], selectedServiceType, currentUserId }) => {
  const selectedServiceKey = normalizeText(selectedServiceType);
  const activeUserId = toSafeString(currentUserId);

  return providers.filter((provider) => {
    if (activeUserId && toSafeString(provider.providerUserId) === activeUserId) {
      return false;
    }

    if (!selectedServiceKey) return true;

    const providerServiceType = normalizeText(provider.serviceType);
    const providerServiceTypeId = normalizeText(provider.serviceTypeId);

    return (
      providerServiceType === selectedServiceKey ||
      providerServiceTypeId === selectedServiceKey
    );
  });
};
