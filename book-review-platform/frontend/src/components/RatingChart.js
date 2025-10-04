import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const RatingChart = ({ reviews, type = 'bar' }) => {
  // Calculate rating distribution
  const ratingDistribution = React.useMemo(() => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    return Object.entries(distribution).map(([rating, count]) => ({
      rating: `${rating} Star${rating !== '1' ? 's' : ''}`,
      count,
      percentage: reviews.length > 0 ? ((count / reviews.length) * 100).toFixed(1) : 0
    }));
  }, [reviews]);

  // Colors for different ratings
  const colors = {
    '1 Star': '#ef4444',    // Red
    '2 Stars': '#f97316',   // Orange
    '3 Stars': '#eab308',   // Yellow
    '4 Stars': '#22c55e',   // Green
    '5 Stars': '#10b981'    // Emerald
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-large border border-gray-200 dark:border-slate-600">
          <p className="font-semibold text-slate-800 dark:text-gray-200">{label}</p>
          <p className="text-primary-600 dark:text-primary-400">
            Count: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-slate-600 dark:text-gray-400">
            Percentage: <span className="font-bold">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-large border border-gray-200 dark:border-slate-600">
          <p className="font-semibold text-slate-800 dark:text-gray-200">{data.rating}</p>
          <p className="text-primary-600 dark:text-primary-400">
            Count: <span className="font-bold">{data.count}</span>
          </p>
          <p className="text-slate-600 dark:text-gray-400">
            Percentage: <span className="font-bold">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 rounded-3xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-slate-600 dark:text-gray-400 font-medium">
          No reviews yet to display rating distribution
        </p>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ratingDistribution.filter(item => item.count > 0)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ rating, percentage }) => `${rating}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {ratingDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.rating]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={ratingDistribution}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="rating" 
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-slate-600 dark:text-gray-400"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-slate-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            radius={[8, 8, 0, 0]}
            fill="url(#colorGradient)"
          >
            {ratingDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry.rating]} />
            ))}
          </Bar>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2491eb" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2491eb" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingChart;