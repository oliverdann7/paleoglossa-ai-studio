import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface ChartsSectionProps {
  trendData: any[];
}

export default function ChartsSection({ trendData }: ChartsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="card p-6 flex flex-col">
        <h4 className="eyebrow text-amber mb-4 font-bold">
          {t('stats.knownWords30d', 'Known Words (30d)')}
        </h4>
        <div className="h-32 w-full relative group flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorKnown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F1DAB0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F1DAB0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FCFBF8',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
                labelFormatter={(label) => format(parseISO(label as string), 'MMM d, yyyy')}
              />
              <Area
                type="monotone"
                dataKey="knownWords"
                stroke="#d4ab6a"
                fillOpacity={1}
                fill="url(#colorKnown)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card p-6 flex flex-col">
        <h4 className="eyebrow text-blue mb-4 font-bold">
          {t('stats.dailyReading30d', 'Daily Reading (30d)')}
        </h4>
        <div className="h-32 w-full relative flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FCFBF8',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
                labelFormatter={(label) => format(parseISO(label as string), 'MMM d, yyyy')}
                cursor={{ fill: 'rgba(30, 61, 110, 0.1)' }}
              />
              <Bar dataKey="readWords" fill="#1E3D6E" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card p-6 flex flex-col">
        <h4 className="eyebrow text-green-600 mb-4 font-bold">
          {t('stats.readingTime30d', 'Reading Time (30d)')}
        </h4>
        <div className="h-32 w-full relative flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FCFBF8',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
                labelFormatter={(label) => format(parseISO(label as string), 'MMM d, yyyy')}
                formatter={(val: any) => [`${val} min`, t('stats.time', 'Time')]}
              />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
