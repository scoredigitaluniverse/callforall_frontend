import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { providerT } from '../i18n/translations';
import {
  getActiveProviderBooking,
  updateProviderBookingStatus,
} from '../api/providerApi';
import type { ProviderBooking } from '../types';

const nextActionByStatus: Record<string, { labelKey: 'onTheWay' | 'inProgress' | 'completed'; status: string } | null> = {
  accepted: { labelKey: 'onTheWay', status: 'on_the_way' },
  on_the_way: { labelKey: 'inProgress', status: 'in_progress' },
  in_progress: { labelKey: 'completed', status: 'completed' },
  completed: null,
  paid: null,
};

const ProviderActiveJobPage = () => {
  const t = providerT;
  const [booking, setBooking] = useState<ProviderBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadActiveBooking = async () => {
      try {
        const activeBooking = await getActiveProviderBooking();
        setBooking(activeBooking);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : t('unableFetchActiveBooking'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadActiveBooking();
  }, []);

  const nextAction = useMemo(() => {
    if (!booking) return null;
    return nextActionByStatus[booking.status] || null;
  }, [booking]);

  const handleStatusUpdate = async () => {
    if (!booking || !nextAction) return;

    setIsUpdating(true);

    try {
      const updatedBooking = await updateProviderBookingStatus({
        bookingId: booking.id,
        status: nextAction.status,
      });

      setBooking(updatedBooking.status === 'completed' ? null : updatedBooking);
      window.alert(`${t('bookingMarkedAs')} ${updatedBooking.status}.`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t('unableUpdateBookingStatus'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="provider-app-page">
      <div className="provider-app-page-header">
        <div>
          <p className="provider-app-eyebrow">{t('activeJob')}</p>
          <h2>{t('currentBooking')}</h2>
        </div>
      </div>

      {isLoading ? <div className="provider-app-card">{t('loadingCurrentJob')}</div> : null}

      {!isLoading && !booking ? (
        <div className="provider-app-card">
          <h3>{t('noActiveJob')}</h3>
          <p className="provider-app-muted">
            {t('acceptRequestToTrackJob')}
          </p>
          <Link className="provider-app-button provider-app-button-primary provider-app-inline-link" to="/requests">
            {t('viewRequests')}
          </Link>
        </div>
      ) : null}

      {!isLoading && booking ? (
        <article className="provider-app-card provider-app-card-wide">
          <h3>{booking.client?.name || t('client')}</h3>
          <p className="provider-app-muted">{booking.serviceType || t('serviceNotSpecified')}</p>

          <div className="provider-app-detail-list">
            <div>
              <span>{t('status')}</span>
              <strong>{booking.status}</strong>
            </div>
            <div>
              <span>{t('clientContact')}</span>
              <strong>{booking.client?.phone || booking.client?.email || t('unavailable')}</strong>
            </div>
            <div>
              <span>{t('quotation')}</span>
              <strong>{booking.quotationId ? t('submitted') : t('pending')}</strong>
            </div>
          </div>

          {booking.status === 'accepted' && !booking.quotationId ? (
            <Link className="provider-app-button provider-app-button-secondary provider-app-inline-link" to="/quotation">
              {t('addQuotation')}
            </Link>
          ) : null}

          {nextAction ? (
            <button
              type="button"
              className="provider-app-button provider-app-button-primary"
              onClick={handleStatusUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? t('processing') : t(nextAction.labelKey)}
            </button>
          ) : null}

          {booking.status === 'completed' ? (
            <p className="provider-app-note">
              {t('jobCompletedWaitForConfirmation')}
            </p>
          ) : null}
        </article>
      ) : null}
    </section>
  );
};

export default ProviderActiveJobPage;
