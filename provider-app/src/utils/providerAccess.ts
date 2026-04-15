import type { ProviderApplication, ProviderProfile } from '../types';

export const isApprovedProviderProfile = (profile?: ProviderProfile | null) => {
  if (!profile) return false;

  const status = String(profile.serviceProviderStatus || '').trim().toLowerCase();
  return Boolean(profile.isServiceProvider || status === 'approved');
};

export const getProviderLandingPath = ({
  profile,
  application,
}: {
  profile?: ProviderProfile | null;
  application?: ProviderApplication | null;
}) => {
  if (isApprovedProviderProfile(profile) || application?.status === 'approved') {
    return '/dashboard';
  }

  if (application?.status === 'pending' || application?.status === 'rejected') {
    return '/status';
  }

  return '/kyc';
};
