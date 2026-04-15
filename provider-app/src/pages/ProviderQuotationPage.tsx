import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { providerT } from '../i18n/translations';
import {
  createProviderQuotation,
  getActiveProviderBooking,
} from '../api/providerApi';
import type { ProviderBooking } from '../types';

const ProviderQuotationPage = () => {
  const t = providerT;
  const navigate = useNavigate();
  const [booking, setBooking] = useState<ProviderBooking | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!booking) {
      window.alert(t('acceptBookingBeforeQuotation'));
      return;
    }

    if (booking.status !== 'accepted') {
      window.alert(t('quotationAllowedWhenAccepted'));
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      window.alert(t('enterValidQuotationAmount'));
      return;
    }

    setIsSubmitting(true);

    try {
      const quotation = await createProviderQuotation({
        bookingId: booking.id,
        amount: numericAmount,
      });

      const nextBooking = {
        ...booking,
        quotationId: quotation.id,
      };

      setBooking(nextBooking);
      window.alert(t('quotationSubmittedSuccessfully'));
      navigate('/active');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : t('unableSubmitQuotation'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="provider-app-page">
      <div className="provider-app-page-header">
        <div>
          <p className="provider-app-eyebrow">{t('quotation')}</p>
          <h2>{t('createQuotation')}</h2>
        </div>
      </div>

      {isLoading ? <div className="provider-app-card">{t('loadingCurrentJob')}</div> : null}

      {!isLoading && !booking ? (
        <div className="provider-app-card">
          <h3>{t('noAcceptedBookingFound')}</h3>
          <p className="provider-app-muted">
            {t('acceptRequestFirstThenQuotation')}
          </p>
          <Link className="provider-app-button provider-app-button-primary provider-app-inline-link" to="/requests">
            {t('goToRequests')}
          </Link>
        </div>
      ) : null}

      {!isLoading && booking ? (
        <article className="provider-app-card provider-app-card-wide">
          <h3>{booking.client?.name || t('client')}</h3>
          <p className="provider-app-muted">{booking.serviceType || t('serviceNotSpecified')}</p>

          <form className="provider-app-form" onSubmit={handleSubmit}>
            <p className="provider-app-muted">
              Enter only the work cost. Basic pay is added separately when the client reviews the quotation.
            </p>

            <label className="provider-app-label">
              {t('quotationAmount')}
              <input
                className="provider-app-input"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder={t('enterAmount')}
              />
            </label>

            <button
              type="submit"
              className="provider-app-button provider-app-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('processing') : t('submitQuotation')}
            </button>
          </form>
        </article>
      ) : null}
    </section>
  );
};

export default ProviderQuotationPage;
