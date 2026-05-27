import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils.js';
import { computeReviewForecast } from '../lib/services/forecastService.js';
import type { KnowledgeMap } from '../lib/services/vocabularyService.js';

interface ReviewForecastProps {
  knowledge: KnowledgeMap;
  className?: string;
}

export function ReviewForecast({ knowledge, className }: ReviewForecastProps) {
  const { t } = useTranslation();
  const days = computeReviewForecast(knowledge, 7);
  const totalDue = days.reduce((sum, d) => sum + d.count, 0);

  const data = days.map((d) => ({
    label: d.label,
    count: d.count,
    isToday: d.isToday,
  }));

  return (
    <div className={cn('card p-6', className)}>
      <p className="text-[11px] font-bold text-ink3 uppercase tracking-widest mb-4">
        {t('dashboard.reviewForecast', 'Review Forecast')}
      </p>

      {totalDue === 0 ? (
        <div className="flex flex-col items-center justify-center h-28 text-muted">
          <CalendarDays className="w-7 h-7 mb-2 opacity-30" />
          <p className="text-sm text-ink3">
            {t('forecast.allCaughtUp', 'No reviews due this week')}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data} margin={{ top: 18, right: 4, left: -36, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--color-ink3, #6b7280)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: '1px solid var(--color-bdr, #e5e7eb)',
                background: 'var(--color-parch, #faf9f6)',
              }}
              formatter={(value: unknown) => [
                typeof value === 'number' ? value : 0,
                t('forecast.cardsToReview', 'cards to review'),
              ]}
              labelStyle={{ fontWeight: 700 }}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={44}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? '#3B82F6' : '#d4ab6a'}
                  fillOpacity={entry.isToday ? 1 : 0.65}
                />
              ))}
              <LabelList
                dataKey="count"
                position="top"
                formatter={(value: unknown) =>
                  typeof value === 'number' && value > 0 ? String(value) : ''
                }
                style={{
                  fontSize: 10,
                  fill: 'var(--color-ink3, #6b7280)',
                  fontWeight: 700,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
