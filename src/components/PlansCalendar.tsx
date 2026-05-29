import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as IconCalendar, Clock, Landmark, Sparkles, MapPin, Check, Plus, Trash2, X } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: "appointment" | "special" | "goal" | "dream" | "birthday" | "personal";
  color?: string;
  completed: boolean;
}

interface PlansCalendarProps {
  isAdmin: boolean;
}

export default function PlansCalendar({ isAdmin }: PlansCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 4 = May in indexing (0-based: 0=Jan, 4=May)
  const [selectedDate, setSelectedDate] = useState<string>("2026-05-30"); // Default tomorrow birthday!

  // Creator Modal Sheets state
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("2026-05-30");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState<any>("personal");
  const [newColor, setNewColor] = useState("primary");
  const [submittingProgress, setSubmittingProgress] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Error loaded events calendar", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday
  };

  const handleMonthNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleMonthPrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleCellClick = (dayNum: number) => {
    const formattedD = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    setSelectedDate(formattedD);
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    setSubmittingProgress(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          date: newDate,
          time: newTime,
          type: newType,
          color: newColor
        })
      });

      if (res.ok) {
        const savedEvent = await res.json();
        setEvents((prev) => [...prev, savedEvent]);
        setShowAddEvent(false);
        // Reset Creator
        setNewTitle("");
        setNewDesc("");
        setNewDate("2026-05-30");
        setNewTime("");
        setNewType("personal");
      }
    } catch (err) {
      console.error("Error writing event plans", err);
    } finally {
      setSubmittingProgress(false);
    }
  };

  const handleToggleEvent = async (id: string, currentCompleted: boolean) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentCompleted })
      });

      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      }
    } catch (error) {
      console.error("Error toggling event state", error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Error deleting event schedules", error);
    }
  };

  // Helper calendar mapping builders
  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", { month: "long" });

  const selectedDateEvents = events.filter((e) => e.date === selectedDate);

  // Styling helper mapping categories -> color accents
  const TYPE_ACCENTS = {
    appointment: { bg: "bg-rose-50 dark:bg-red-950/20", border: "border-rose-200 dark:border-red-950/40 text-rose-800 dark:text-rose-200" },
    special: { bg: "bg-amber-50 dark:bg-amber-950/25", border: "border-amber-200 dark:border-amber-950/40 text-amber-800 dark:text-amber-200" },
    goal: { bg: "bg-emerald-50 dark:bg-emerald-950/25", border: "border-emerald-200 dark:border-emerald-950/40 text-emerald-800 dark:text-emerald-200" },
    dream: { bg: "bg-purple-50 dark:bg-purple-950/25", border: "border-purple-200 dark:border-purple-950/40 text-purple-800 dark:text-purple-200" },
    birthday: { bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-950/50 text-yellow-800 dark:text-yellow-100 font-bold" },
    personal: { bg: "bg-blue-50 dark:bg-blue-950/25", border: "border-blue-200 dark:border-blue-950/40 text-blue-800 dark:text-blue-200" }
  };

  const TYPE_BADGE_PRESET = [
    { key: "personal", label: "Personal" },
    { key: "appointment", label: "Editorial appointment" },
    { key: "special", label: "Gala fitting" },
    { key: "goal", label: "Goal tracker" },
    { key: "dream", label: "Dream reserve" },
    { key: "birthday", label: "Golden Celebration" }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-2">
            Plans & Encounters
          </h1>
          <p className="font-accent-italic text-lg text-[#6c5a5d] dark:text-[#d8c1c4] italic mb-1">
            Setting editorial spaces, romantic trips & dream alignments.
          </p>
        </div>
        <button
          onClick={() => setShowAddEvent(true)}
          className="luxine-glow-button px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition-transform text-white font-sans font-bold text-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Event</span>
        </button>
      </div>

      {/* Main Grid: Calendar left side, side list right side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left segment - Calendar interface Card (Span 8) */}
        <section className="bg-white dark:bg-[#1E0D10] p-6 rounded-[28px] shadow-sm border border-[#FFE4E4]/10 dark:border-red-950/5 lg:col-span-8">
          {/* Controls bar */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl font-bold text-[#1c1b1b] dark:text-[#fcf9f8] italic">
              {monthName} {currentYear}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleMonthPrev}
                className="p-2 border border-[#FFE4E4]/40 hover:bg-[#FFF5F5] dark:hover:bg-[#180A0C] text-[#6c5a5d] rounded-full cursor-pointer transition-colors"
              >
                &larr;
              </button>
              <button
                onClick={handleMonthNext}
                className="p-2 border border-[#FFE4E4]/40 hover:bg-[#FFF5F5] dark:hover:bg-[#180A0C] text-[#6c5a5d] rounded-full cursor-pointer transition-colors"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Days labels */}
          <div className="grid grid-cols-7 gap-2 text-center border-b border-[#FFE4E4]/20 pb-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day} className="font-label-mono text-[9px] text-[#926e6b] font-bold">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Fill empty dates before Month starts */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty_${i}`} className="aspect-square bg-[#fcf9f8]/40 dark:bg-transparent rounded-xl" />
            ))}

            {/* Days cells generation */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const cellDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = selectedDate === cellDate;
              
              const dayEvents = events.filter((e) => e.date === cellDate);
              const hasEvents = dayEvents.length > 0;
              const hasBirthday = dayEvents.some((e) => e.type === "birthday");

              return (
                <div
                  key={`day_${dayNum}`}
                  onClick={() => handleCellClick(dayNum)}
                  className={`aspect-square relative flex items-center justify-center rounded-2xl cursor-pointer font-sans text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95 border ${
                    isSelected
                      ? "bg-[#e8182c] border-[#bd001d] text-white shadow-[0px_4px_12px_rgba(232,24,44,0.25)]"
                      : hasBirthday
                      ? "bg-amber-100/50 dark:bg-amber-950/20 border-amber-300 text-amber-900 dark:text-amber-200"
                      : "bg-[#fdfbfb] dark:bg-[#180a0c] border-[#FFE4E4]/10 dark:border-red-950/5 text-[#1c1b1b] dark:text-[#fcf9f8] hover:bg-[#FFE4E4]/25 dark:hover:bg-red-950/10"
                  }`}
                >
                  <span>{dayNum}</span>

                  {/* Highlights marker indicators */}
                  {hasEvents && !isSelected && (
                    <span
                      className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${
                        hasBirthday ? "bg-amber-500 animate-pulse" : "bg-[#e8182c]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Right segment - Details list Section (Span 4) */}
        <section className="bg-white dark:bg-[#1E0D10] p-6 rounded-[28px] shadow-sm border border-[#FFE4E4]/10 dark:border-red-950/5 lg:col-span-4 flex flex-col min-h-[400px]">
          <div className="border-b border-[#FFE4E4]/15 pb-4 mb-4">
            <span className="font-label-mono text-[10px] text-[#e8182c] font-bold">Planned alignment</span>
            <h4 className="font-serif text-lg font-bold text-[#1c1b1b] dark:text-[#fcf9f8] italic mt-0.5">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h4>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-[#e8182c] border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : selectedDateEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <IconCalendar className="w-8 h-8 text-[#926e6b]/40 mb-3" />
              <p className="font-accent-italic text-sm text-[#926e6b] italic">No planned checkpoints or luxury events listed for this date block details.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[50vh]">
              {selectedDateEvents.map((evt) => {
                const accent = TYPE_ACCENTS[evt.type] || TYPE_ACCENTS.personal;
                return (
                  <div
                    key={evt.id}
                    className={`rounded-2xl p-4 border flex flex-col justify-between group transition-all duration-350 hover:shadow-sm ${accent.bg} ${accent.border}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1">
                        {evt.type === "birthday" && <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />}
                        <div>
                          <h5 className={`font-sans text-sm font-bold ${evt.completed ? "line-through opacity-50" : ""}`}>
                            {evt.title}
                          </h5>
                          {evt.description && (
                            <p className="font-sans text-[11px] text-[#926e6b] mt-1 pr-2">
                              {evt.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Complete indicator check triggers */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleEvent(evt.id, evt.completed)}
                          className="w-5 h-5 rounded-full border border-current flex items-center justify-center hover:scale-110 cursor-pointer active:scale-95"
                          title="Flag Completed"
                        >
                          {evt.completed && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          className="w-5 h-5 text-red-700 hover:text-red-900 rounded flex items-center justify-center hover:scale-110 cursor-pointer active:scale-95 border border-transparent hover:border-red-300"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {evt.time && (
                      <div className="flex items-center gap-1 font-label-mono text-[9px] text-[#926e6b] mt-3">
                        <Clock className="w-3 h-3" />
                        <span>{evt.time}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Creator Drawers popup modal sheets */}
      <AnimatePresence>
        {showAddEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 shadow-xl backdrop-blur-sm z-[110] flex items-end justify-center"
            onClick={() => setShowAddEvent(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fcf9f8] dark:bg-[#0f0507] w-full max-w-xl rounded-t-[32px] p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl font-bold italic text-[#1c1b1b] dark:text-[#fcf9f8]">
                  Log New Plan Event
                </h3>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="text-[#926e6b] hover:text-[#e8182c] p-1 rounded-full hover:bg-[#FFE4E4]/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEventSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-label-mono text-[10px] text-[#926e6b]">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Vogue Editorial shoot / Gala Preview..."
                    className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Event Date</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Time (Optional)</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Category Alignment</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                    >
                      {TYPE_BADGE_PRESET.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-mono text-[10px] text-[#926e6b]">Focus Accent Color</label>
                    <select
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none"
                    >
                      <option value="primary">Classic Crimson Red</option>
                      <option value="secondary">Gold Glow Yellow</option>
                      <option value="tertiary">Cosmic Violet</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-mono text-[10px] text-[#926e6b]">Location / Details descriptions</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide details of location, fittings, reservation specifics..."
                    rows={3}
                    className="w-full bg-white dark:bg-[#1E0D10] border border-[#e7bcb9] dark:border-red-950/40 px-4 py-3 rounded-xl font-sans text-sm text-[#1c1b1b] dark:text-[#fcf9f8] outline-none font-accent-italic text-lg italic"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingProgress || !newTitle}
                  className="luxine-glow-button w-full py-4 rounded-xl text-white font-sans font-bold text-sm uppercase tracking-wider"
                >
                  {submittingProgress ? "Writing database files..." : "Register Encounter Checkpoint"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
