import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Navigation from '../components/Navigation';
import ServiceCard from '../components/ServiceCard';
import { mockServices } from '../data/mockData';
import { getTranslation } from '../i18n/translations';

const FLOW_STEPS = [
  {
    title: '1. Pick a service',
    description: 'Choose the service you need and view nearby verified providers.',
  },
  {
    title: '2. Send booking request',
    description: 'The provider accepts the job and shares a quotation for approval.',
  },
  {
    title: '3. Pay after completion',
    description: 'Confirm the work, pay through Razorpay, and leave a rating.',
  },
];

const ServicePage = ({ lang }) => {
  const navigate = useNavigate();
  const t = (key) => getTranslation(lang, key);

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navigation lang={lang} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="rounded-3xl border border-[#dbeafe] bg-[#edf6ff] p-6">
          <h1 className="text-3xl font-semibold text-[#0b3d91]">{t('services')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Choose a category to view nearby providers and start the booking flow with
            quotation approval, completion confirmation, payment, and rating.
          </p>
        </section>

        <section>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mockServices.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => navigate(`/category/${service.id}`)}
                className="text-left"
              >
                <ServiceCard service={service} lang={lang} />
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {FLOW_STEPS.map((step) => (
            <article
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <h2 className="text-lg font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </article>
          ))}
        </section>
      </main>

      <BottomNav lang={lang} />
    </div>
  );
};

export default ServicePage;
