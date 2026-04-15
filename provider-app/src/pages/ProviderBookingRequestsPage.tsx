import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerT } from '../i18n/translations';
import {
  acceptProviderBooking,
  getProviderBookingRequests,
  rejectProviderBooking,
} from '../api/providerApi';
import type { ProviderBooking } from '../types';

const ProviderBookingRequestsPage = () => {
  const t = providerT;
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ProviderBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequestAction, setActiveRequestAction] = useState<{
    id: string;
    type: 'accept' | 'reject';
  } | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await getProviderBookingRequests();
        setRequests(data);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : t('unableFetchBookingRequests'));
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleAccept = async (request: ProviderBooking) => {
    setActiveRequestAction({
      id: request.id,
      type: 'accept',
    });

    try {
      await acceptProviderBooking(request.id);
      setRequests((current) => current.filter((item) => item.id !== request.id));
      window.alert(t('bookingAccepted'));
      navigate('/active');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t('unableAcceptBooking'));
    } finally {
      setActiveRequestAction(null);
    }
  };

  const handleReject = async (request: ProviderBooking) => {
    setActiveRequestAction({
      id: request.id,
      type: 'reject',
    });

    try {
      await rejectProviderBooking(request.id);
      setRequests((current) => current.filter((item) => item.id !== request.id));
      window.alert(t('bookingRejected'));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t('unableRejectBooking'));
    } finally {
      setActiveRequestAction(null);
    }
  };

  return (
    <section className="provider-app-page">
      <div className="provider-app-page-header">
        <div>
          <p className="provider-app-eyebrow">{t('bookings')}</p>
          <h2>{t('pendingRequests')}</h2>
        </div>
      </div>

      {isLoading ? <div className="provider-app-card">{t('loadingRequests')}</div> : null}

      {!isLoading && requests.length === 0 ? (
        <div className="provider-app-card">
          <h3>{t('noPendingRequests')}</h3>
          <p className="provider-app-muted">{t('newClientBookingsWillAppear')}</p>
        </div>
      ) : null}

      <div className="provider-app-card-grid">
        {requests.map((request) => {
          const isWorking = activeRequestAction?.id === request.id;
          const isAccepting = isWorking && activeRequestAction?.type === 'accept';
          const isRejecting = isWorking && activeRequestAction?.type === 'reject';

          return (
            <article key={request.id} className="provider-app-card">
              <h3>{request.client?.name || t('client')}</h3>
              <p className="provider-app-muted">
                {request.client?.phone || request.client?.email || t('noContactDetails')}
              </p>

              <div className="provider-app-detail-list">
                <div>
                  <span>{t('service')}</span>
                  <strong>{request.serviceType || t('notSpecified')}</strong>
                </div>
                <div>
                  <span>{t('status')}</span>
                  <strong>{request.status}</strong>
                </div>
              </div>

              <div className="provider-app-issue-box">
                <span className="provider-app-issue-label">{t('clientIssue')}</span>
                <p className="provider-app-issue-text">{(request.notes || '').trim() || t('notSpecified')}</p>
              </div>

              <div className="provider-app-button-row">
                <button
                  type="button"
                  className="provider-app-button provider-app-button-primary"
                  onClick={() => handleAccept(request)}
                  disabled={isWorking}
                >
                  {isAccepting ? t('processing') : t('accept')}
                </button>
                <button
                  type="button"
                  className="provider-app-button provider-app-button-secondary"
                  onClick={() => handleReject(request)}
                  disabled={isWorking}
                >
                  {isRejecting ? t('processing') : t('reject')}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ProviderBookingRequestsPage;
