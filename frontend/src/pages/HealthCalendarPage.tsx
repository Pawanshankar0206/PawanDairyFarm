import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pill,
  Syringe,
  Heart,
  Baby,
  Stethoscope,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  animal_type: string;
  animal_id: string;
  status: string;
  color: string;
  details: string;
  url: string;
}

export const HealthCalendarPage: React.FC<{ onNavigateToEntity?: (tab: string, id?: string) => void }> = ({
  onNavigateToEntity
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-11-04'));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const data = await api.get<CalendarEvent[]>('/calendar/events');
        setEvents(data);
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const eventTypes = [
    'All',
    'Deworming',
    'Vaccination',
    'Insemination',
    'Expected Delivery',
    'Calving Delivery',
    'Vet Visit',
    'Medical Follow-up'
  ];

  const filteredEvents = events.filter((ev) => {
    return typeFilter === 'All' || ev.type === typeFilter;
  });

  // Month Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
            <span>Farm Health & Breeding Master Calendar</span>
          </h2>
          <p className="text-xs text-slate-400">
            Centralized synchronization across Buffaloes, Calves, and Cows: Deworming, Vaccinations, Inseminations, and Calvings.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
            {(['month', 'week', 'day', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors ${
                  viewMode === mode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar: Month Navigation & Filter */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white font-display min-w-[150px] text-center">
            {monthName}
          </span>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date('2026-11-04'))}
            className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-emerald-400 hover:bg-slate-700"
          >
            Today (04 Nov)
          </button>
        </div>

        {/* Filter by Activity */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {eventTypes.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All Event Types' : t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MONTH CALENDAR VIEW */}
      {viewMode === 'month' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/80 text-center py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Month Matrix */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 bg-slate-900/40 min-h-[500px]">
            {/* Blank leading days */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`blank-${i}`} className="p-2 bg-slate-950/30 text-slate-700 text-xs" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = filteredEvents.filter((ev) => ev.date === dateStr);
              const isToday = dateStr === '2026-11-04';

              return (
                <div
                  key={dayNum}
                  className={`p-2 min-h-[90px] flex flex-col justify-between transition-colors ${
                    isToday ? 'bg-emerald-950/20 ring-1 ring-emerald-500/50' : 'hover:bg-slate-850/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                        isToday ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] text-slate-500 font-mono">{dayEvents.length}</span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() =>
                          onNavigateToEntity &&
                          onNavigateToEntity(ev.animal_type === 'Buffalo' ? 'buffaloes' : 'calves', ev.animal_id)
                        }
                        style={{ borderLeftColor: ev.color }}
                        className="p-1 rounded bg-slate-950 border-l-2 border-t border-r border-b border-slate-800 text-[10px] cursor-pointer hover:bg-slate-800 transition-colors"
                        title={`${ev.title}\n${ev.details}`}
                      >
                        <div className="font-semibold text-slate-200 truncate">{ev.title}</div>
                        <div className="text-[9px] text-slate-400 truncate">{ev.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST / YEARLY VIEW */}
      {(viewMode === 'list' || viewMode === 'week' || viewMode === 'day') && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
              <span>Chronological Health & Breeding Agenda</span>
            </h3>
            <span className="text-xs text-slate-400">{filteredEvents.length} events scheduled</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No events found.</div>
            ) : (
              filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() =>
                    onNavigateToEntity &&
                    onNavigateToEntity(ev.animal_type === 'Buffalo' ? 'buffaloes' : 'calves', ev.animal_id)
                  }
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      style={{ backgroundColor: `${ev.color}20`, borderColor: `${ev.color}50` }}
                      className="p-2 rounded-xl border text-xs font-bold font-mono text-white shrink-0 mt-0.5"
                    >
                      {new Date(ev.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{ev.title}</span>
                        <span
                          style={{ backgroundColor: `${ev.color}25`, color: ev.color }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        >
                          {ev.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{ev.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                      {ev.status}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                      Open Profile →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
