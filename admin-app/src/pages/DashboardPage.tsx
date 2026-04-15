import { CreditCard, Package, Users, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardStats, getReviews } from '../api/adminApi';
import StatCard from '../components/StatCard';
import { formatCurrency, normalizeDashboardStats } from '../utils/formatters';
import BookingsOverTimeChart, {
  type BookingsOverTimePoint,
} from '../components/charts/BookingsOverTimeChart';
import ServiceTypeShareChart, {
  type ServiceTypeSlice,
} from '../components/charts/ServiceTypeShareChart';
import RatingDistributionChart, {
  type RatingBucket,
} from '../components/charts/RatingDistributionChart';
import RevenueByServiceChart, {
  type RevenueByServicePoint,
} from '../components/charts/RevenueByServiceChart';

const EMPTY_STATS = {
  totalUsers: 0,
  totalProviders: 0,
  totalBookings: 0,
  totalRevenue: 0,
};

const EMPTY_RATING_DISTRIBUTION: RatingBucket[] = [
  { label: '5★', count: 0 },
  { label: '4★', count: 0 },
  { label: '3★', count: 0 },
  { label: '2★', count: 0 },
  { label: '1★', count: 0 },
];

const DashboardPage = () => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [bookingsTrend, setBookingsTrend] = useState<BookingsOverTimePoint[]>([]);
  const [serviceShare, setServiceShare] = useState<ServiceTypeSlice[]>([]);
  const [revenueByService, setRevenueByService] = useState<RevenueByServicePoint[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<RatingBucket[]>(
    EMPTY_RATING_DISTRIBUTION
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      setError('');

      try {
        const [dashboardResponse, reviewsResponse] = await Promise.all([
          getDashboardStats(range),
          getReviews(),
        ]);

        if (!isMounted) return;

        setStats(normalizeDashboardStats(dashboardResponse));

        const trendData = (Array.isArray(dashboardResponse?.ordersTrend)
          ? dashboardResponse.ordersTrend
          : []
        ).map((point: any) => {
          const date = new Date(point?.date);
          const label = Number.isNaN(date.getTime())
            ? String(point?.date || '')
            : date.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
              });

          return {
            label,
            total: Number(point?.orders) || 0,
          };
        });

        const serviceShareData = (Array.isArray(dashboardResponse?.serviceDistribution)
          ? dashboardResponse.serviceDistribution
          : []
        ).map((item: any) => ({
          service: String(item?.name || 'Unknown'),
          bookings: Number(item?.value) || 0,
        }));

        const revenueByServiceData = (Array.isArray(dashboardResponse?.revenueByService)
          ? dashboardResponse.revenueByService
          : []
        ).map((item: any) => ({
          service: String(item?.service || 'Unknown'),
          revenue: Number(item?.revenue) || 0,
        }));

        const reviews = Array.isArray(reviewsResponse) ? reviewsResponse : [];
        const ratingCounts = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        };

        reviews.forEach((review: any) => {
          const rawRating = Number(
            review?.rating ?? review?.stars ?? review?.overall_rating ?? 0
          );
          const rating = Math.round(rawRating);
          if (rating >= 1 && rating <= 5) {
            ratingCounts[rating as 1 | 2 | 3 | 4 | 5] += 1;
          }
        });

        setBookingsTrend(trendData);
        setServiceShare(serviceShareData);
        setRevenueByService(revenueByServiceData);
        setRatingDistribution([
          { label: '5★', count: ratingCounts[5] },
          { label: '4★', count: ratingCounts[4] },
          { label: '3★', count: ratingCounts[3] },
          { label: '2★', count: ratingCounts[2] },
          { label: '1★', count: ratingCounts[1] },
        ]);
      } catch (nextError) {
        if (!isMounted) return;
        setError(nextError instanceof Error ? nextError.message : 'Failed to load dashboard');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, [range]);

  const rangeLabel =
    range === '7d'
      ? 'Last 7 days'
      : range === '30d'
        ? 'Last 30 days'
        : 'All time';

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
            <p className="mt-2 text-sm text-slate-500">
              Key marketplace KPIs for the selected period ({rangeLabel}).
            </p>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span>Time period</span>
            <select
              value={range}
              onChange={(event) =>
                setRange(event.target.value as '7d' | '30d' | 'all')
              }
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </label>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Bookings" value={stats.totalBookings} icon={Package} color="blue" />
            <StatCard title="Total Providers" value={stats.totalProviders} icon={Wrench} color="purple" />
            <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={CreditCard} color="green" />
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="amber" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BookingsOverTimeChart data={bookingsTrend} />
            <ServiceTypeShareChart data={serviceShare} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RevenueByServiceChart data={revenueByService} />
            <RatingDistributionChart data={ratingDistribution} />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
