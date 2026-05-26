import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { DailyStat } from '../lib/services/statsService.js';

interface Props {
  history: DailyStat[];
}

const LEVEL_CLASSES = [
  'bg-parch3 dark:bg-ink2/20',
  'bg-blue/20',
  'bg-blue/40',
  'bg-blue/65',
  'bg-blue',
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function StudyHeatmap({ history }: Props) {
  const { weeks, monthLabels, totalDays, todayStr } = useMemo(() => {
    const today = new Date();
    const todayStr = toDateStr(today);

    // Max activity for normalising colour intensity
    const maxActivity = Math.max(
      1,
      ...history.map((h) => (h.minutes ?? 0) + Math.round((h.readWords ?? 0) / 15))
    );

    const lookup = new Map<string, number>();
    for (const stat of history) {
      const activity = (stat.minutes ?? 0) + Math.round((stat.readWords ?? 0) / 15);
      const level = activity === 0 ? 0 : Math.min(4, Math.ceil((activity / maxActivity) * 4));
      lookup.set(stat.date, level);
    }

    // Go back 91 days (13 weeks), aligned to Sunday
    const start = new Date(today);
    start.setDate(start.getDate() - 90);
    start.setDate(start.getDate() - start.getDay()); // snap to Sunday

    const days: { dateStr: string; level: number; month: number; dayOfWeek: number }[] = [];
    const d = new Date(start);
    while (days.length < 91) {
      const dateStr = toDateStr(d);
      days.push({
        dateStr,
        level: d > today ? -1 : (lookup.get(dateStr) ?? 0),
        month: d.getMonth(),
        dayOfWeek: d.getDay(),
      });
      d.setDate(d.getDate() + 1);
    }

    // Slice into 13 columns (weeks)
    const weeks: typeof days[] = [];
    for (let w = 0; w < 13; w++) weeks.push(days.slice(w * 7, w * 7 + 7));

    // Month label: if the first Sunday of a week is in a new month, show that month
    const monthLabels: (string | null)[] = weeks.map((week, wi) => {
      const firstDay = week[0];
      if (wi === 0) return new Date(firstDay.dateStr).toLocaleDateString('en', { month: 'short' });
      const prevWeekFirst = weeks[wi - 1][0];
      if (firstDay.month !== prevWeekFirst.month) {
        return new Date(firstDay.dateStr).toLocaleDateString('en', { month: 'short' });
      }
      return null;
    });

    return { weeks, monthLabels, totalDays: days.length, todayStr };
  }, [history]);

  const totalActive = history.filter((h) => (h.minutes ?? 0) > 0 || (h.readWords ?? 0) > 0).length;

  return (
    <div className="space-y-2" aria-label="Study activity heatmap">
      {/* Month row */}
      <div className="flex gap-1 pl-5">
        {weeks.map((_, wi) => (
          <div key={wi} className="w-4 text-[9px] text-ink3 font-medium shrink-0 text-center">
            {monthLabels[wi] ?? ''}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-1">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-1 shrink-0">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="w-4 h-4 flex items-center justify-center text-[9px] text-ink3">
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.dateStr}
                title={
                  day.level < 0
                    ? ''
                    : day.dateStr +
                      (day.level > 0 ? ` · ${day.level === 4 ? 'Very active' : day.level === 3 ? 'Active' : day.level === 2 ? 'Some study' : 'Light study'}` : ' · No activity')
                }
                className={cn(
                  'w-4 h-4 rounded-[3px] transition-opacity',
                  day.level < 0
                    ? 'opacity-0'
                    : LEVEL_CLASSES[day.level],
                  day.dateStr === todayStr && 'ring-1 ring-blue ring-offset-1'
                )}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 pl-5 pt-1">
        <span className="text-[10px] text-ink3">Less</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <div key={i} className={cn('w-3 h-3 rounded-[2px]', cls)} />
        ))}
        <span className="text-[10px] text-ink3">More</span>
        <span className="ml-auto text-[10px] text-ink3">
          {totalActive} active {totalActive === 1 ? 'day' : 'days'} in {Math.round(totalDays / 7)} weeks
        </span>
      </div>
    </div>
  );
}
