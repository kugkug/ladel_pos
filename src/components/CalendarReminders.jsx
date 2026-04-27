import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    getYear,
    subYears,
    addYears
} from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar,
    X,
    Trash2,
    Loader2
} from 'lucide-react';
import {
    fetchAllCalendarEvents,
    fetchReminders,
    createCustomReminder,
    deleteReminder
} from '@/lib/calendarRemindersService';
import { useToast } from '@/hooks/use-toast';
import '@/styles/calendar.css';

const CalendarReminders = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    /** 'month' = full month grid; 'year' = 12 mini months for the selected year */
    const [calendarView, setCalendarView] = useState('month');

    // Persist filter in localStorage
    const [activeFilter, setActiveFilter] = useState(() => {
        return localStorage.getItem('calendarActiveFilter') || 'all';
    });
    const [reminderFilter, setReminderFilter] = useState('all'); // all, system, custom

    const [events, setEvents] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [isLoadingReminders, setIsLoadingReminders] = useState(true);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newReminder, setNewReminder] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter Counts
    const [filterCounts, setFilterCounts] = useState({
        all: 0,
        paid: 0,
        overdue: 0,
        upcoming: 0
    });

    useEffect(() => {
        localStorage.setItem('calendarActiveFilter', activeFilter);
    }, [activeFilter]);

    useEffect(() => {
        loadEvents();
    }, [currentMonth]); // Reload when month changes, or could load all and filter

    useEffect(() => {
        loadReminders();
    }, [reminderFilter]);

    const loadEvents = async () => {
        setIsLoadingEvents(true);
        try {
            const data = await fetchAllCalendarEvents();
            // Combine with reminders to show on calendar
            const remData = await fetchReminders('all');

            const reminderEvents = remData.map((r) => ({
                id: `rem-${r.id}`,
                date: r.date,
                title: `Reminder: ${r.description}`,
                type: 'reminder'
            }));

            const allCombined = [...data, ...reminderEvents];
            setEvents(allCombined);

            setFilterCounts({
                all: allCombined.length,
                paid: allCombined.filter((e) => e.type === 'paid').length,
                overdue: allCombined.filter((e) => e.type === 'overdue').length,
                upcoming: allCombined.filter((e) => e.type === 'upcoming')
                    .length
            });
        } catch (error) {
            console.error('Failed to load events', error);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const loadReminders = async () => {
        setIsLoadingReminders(true);
        try {
            const data = await fetchReminders(reminderFilter);
            setReminders(data);
        } catch (error) {
            console.error('Failed to load reminders', error);
        } finally {
            setIsLoadingReminders(false);
        }
    };

    const handleAddReminder = async (e) => {
        e.preventDefault();
        if (!newReminder.description.trim()) return;

        setIsSubmitting(true);
        try {
            await createCustomReminder(newReminder);
            toast({
                title: 'Success',
                description: 'Reminder added successfully.'
            });
            setNewReminder({
                date: format(new Date(), 'yyyy-MM-dd'),
                description: ''
            });
            setShowAddForm(false);
            loadReminders();
            loadEvents(); // update calendar view
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add reminder.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReminder = async (id) => {
        if (!window.confirm('Are you sure you want to delete this reminder?'))
            return;
        try {
            await deleteReminder(id);
            toast({ title: 'Success', description: 'Reminder deleted.' });
            loadReminders();
            loadEvents();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete reminder.',
                variant: 'destructive'
            });
        }
    };

    // Calendar logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekDaysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const displayYear = getYear(currentMonth);

    const getDaysForMonth = (year, monthIndex) => {
        const monthDate = new Date(year, monthIndex, 1);
        const ms = startOfMonth(monthDate);
        const me = endOfMonth(ms);
        const s = startOfWeek(ms);
        const e = endOfWeek(me);
        return eachDayOfInterval({ start: s, end: e });
    };

    const handleCalendarPrev = () => {
        setCurrentMonth(
            calendarView === 'year'
                ? subYears(currentMonth, 1)
                : subMonths(currentMonth, 1)
        );
    };

    const handleCalendarNext = () => {
        setCurrentMonth(
            calendarView === 'year'
                ? addYears(currentMonth, 1)
                : addMonths(currentMonth, 1)
        );
    };

    const getFilteredEventsForDay = (day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        let dayEvents = events.filter((e) => e.date === dayStr);

        if (activeFilter !== 'all') {
            dayEvents = dayEvents.filter((e) => e.type === activeFilter);
        }
        return dayEvents;
    };

    const getEventProjectId = (event) =>
        event?.projectData?.id ||
        event?.invoiceData?.project_id ||
        event?.invoiceData?.projects?.id ||
        null;

    const handleEventClick = (event) => {
        const projectId = getEventProjectId(event);
        if (!projectId) return;
        navigate(`/sales/projects/${projectId}`);
    };

    return (
        <div className='calendar-reminders-container'>
            {/* LEFT: Calendar Section */}
            <div className='calendar-section'>
                <div className='filters-bar'>
                    <button
                        className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All{' '}
                        <span className='filter-count'>{filterCounts.all}</span>
                    </button>

                    <button
                        className={`filter-btn bg-green-500 hover:bg-green-600 text-white ${activeFilter === 'paid' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('paid')}
                    >
                        Paid{' '}
                        <span className='filter-count'>
                            {filterCounts.paid}
                        </span>
                    </button>

                    <button
                        className={`filter-btn bg-red-500 hover:bg-red-600 text-white ${activeFilter === 'overdue' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('overdue')}
                    >
                        Overdue{' '}
                        <span className='filter-count'>
                            {filterCounts.overdue}
                        </span>
                    </button>
                    <button
                        className={`filter-btn bg-orange-500 hover:bg-orange-600 text-white ${activeFilter === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('upcoming')}
                    >
                        Upcoming{' '}
                        <span className='filter-count'>
                            {filterCounts.upcoming}
                        </span>
                    </button>
                </div>

                <div className='calendar-header calendar-header-with-view'>
                    <div
                        className='calendar-view-toggle'
                        role='tablist'
                        aria-label='Calendar view'
                    >
                        <button
                            type='button'
                            role='tab'
                            aria-selected={calendarView === 'month'}
                            className={`calendar-view-toggle-btn ${calendarView === 'month' ? 'active' : ''}`}
                            onClick={() => setCalendarView('month')}
                        >
                            Month
                        </button>
                        <button
                            type='button'
                            role='tab'
                            aria-selected={calendarView === 'year'}
                            className={`calendar-view-toggle-btn ${calendarView === 'year' ? 'active' : ''}`}
                            onClick={() => setCalendarView('year')}
                        >
                            Year
                        </button>
                    </div>
                    <div className='calendar-header-nav'>
                        <button
                            type='button'
                            className='calendar-nav-btn'
                            onClick={handleCalendarPrev}
                            aria-label={
                                calendarView === 'year'
                                    ? 'Previous year'
                                    : 'Previous month'
                            }
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className='calendar-month-title'>
                            {calendarView === 'year'
                                ? String(displayYear)
                                : format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <button
                            type='button'
                            className='calendar-nav-btn'
                            onClick={handleCalendarNext}
                            aria-label={
                                calendarView === 'year'
                                    ? 'Next year'
                                    : 'Next month'
                            }
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {calendarView === 'month' ? (
                    <>
                        <div className='calendar-grid'>
                            {weekDays.map((day) => (
                                <div key={day} className='calendar-day-header'>
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className='calendar-days'>
                            {isLoadingEvents ? (
                                <div className='col-span-7 flex justify-center items-center h-64'>
                                    <Loader2
                                        className='animate-spin text-blue-500'
                                        size={32}
                                    />
                                </div>
                            ) : (
                                days.map((day) => {
                                    const isCurrentMonth = isSameMonth(
                                        day,
                                        monthStart
                                    );
                                    const isToday = isSameDay(day, new Date());
                                    const dayEvents =
                                        getFilteredEventsForDay(day);

                                    return (
                                        <div
                                            key={day.toString()}
                                            className={`calendar-day-cell ${!isCurrentMonth ? 'other-month' : ''}`}
                                        >
                                            <span
                                                className={`day-number ${isToday ? 'today' : ''}`}
                                            >
                                                {format(day, 'd')}
                                            </span>
                                            <div>
                                                {dayEvents.map((evt, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`event-badge event-${evt.type}`}
                                                        title={evt.title}
                                                        onClick={() =>
                                                            handleEventClick(evt)
                                                        }
                                                        role='button'
                                                        tabIndex={
                                                            getEventProjectId(
                                                                evt
                                                            )
                                                                ? 0
                                                                : -1
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                    'Enter' ||
                                                                e.key === ' '
                                                            ) {
                                                                e.preventDefault();
                                                                handleEventClick(
                                                                    evt
                                                                );
                                                            }
                                                        }}
                                                        style={{
                                                            cursor: getEventProjectId(
                                                                evt
                                                            )
                                                                ? 'pointer'
                                                                : 'default'
                                                        }}
                                                    >
                                                        {evt.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                ) : (
                    <div className='calendar-year-view'>
                        {isLoadingEvents ? (
                            <div className='calendar-year-loading'>
                                <Loader2
                                    className='animate-spin text-blue-500'
                                    size={32}
                                />
                            </div>
                        ) : (
                            Array.from({ length: 12 }, (_, monthIndex) => {
                                const monthDays = getDaysForMonth(
                                    displayYear,
                                    monthIndex
                                );
                                const monthStartMini = startOfMonth(
                                    new Date(displayYear, monthIndex, 1)
                                );
                                return (
                                    <div
                                        key={monthIndex}
                                        className='calendar-year-month'
                                    >
                                        <div className='calendar-year-month-title'>
                                            {format(monthStartMini, 'MMMM')}
                                        </div>
                                        <div className='calendar-year-weekdays'>
                                            {weekDaysShort.map((d, i) => (
                                                <div
                                                    key={`${monthIndex}-h-${i}`}
                                                    className='calendar-year-weekday'
                                                >
                                                    {d}
                                                </div>
                                            ))}
                                        </div>
                                        <div className='calendar-year-days'>
                                            {monthDays.map((day) => {
                                                const inMonth = isSameMonth(
                                                    day,
                                                    monthStartMini
                                                );
                                                const isToday = isSameDay(
                                                    day,
                                                    new Date()
                                                );
                                                const dayEvents =
                                                    getFilteredEventsForDay(
                                                        day
                                                    );
                                                const showBadges = Math.min(
                                                    dayEvents.length,
                                                    2
                                                );
                                                const more =
                                                    dayEvents.length -
                                                    showBadges;

                                                return (
                                                    <div
                                                        key={day.toString()}
                                                        className={`calendar-year-day-cell ${!inMonth ? 'other-month' : ''}`}
                                                    >
                                                        <span
                                                            className={`calendar-year-day-number ${isToday ? 'today' : ''}`}
                                                        >
                                                            {format(day, 'd')}
                                                        </span>
                                                        {inMonth &&
                                                            dayEvents.length >
                                                                0 && (
                                                                <div className='calendar-year-events'>
                                                                    {dayEvents
                                                                        .slice(
                                                                            0,
                                                                            showBadges
                                                                        )
                                                                        .map(
                                                                            (
                                                                                evt,
                                                                                idx
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        idx
                                                                                    }
                                                                                    className={`event-badge event-${evt.type} calendar-year-event-badge`}
                                                                                    title={
                                                                                        evt.title
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleEventClick(
                                                                                            evt
                                                                                        )
                                                                                    }
                                                                                    role='button'
                                                                                    tabIndex={
                                                                                        getEventProjectId(
                                                                                            evt
                                                                                        )
                                                                                            ? 0
                                                                                            : -1
                                                                                    }
                                                                                    onKeyDown={(
                                                                                        e
                                                                                    ) => {
                                                                                        if (
                                                                                            e.key ===
                                                                                                'Enter' ||
                                                                                            e.key ===
                                                                                                ' '
                                                                                        ) {
                                                                                            e.preventDefault();
                                                                                            handleEventClick(
                                                                                                evt
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                    style={{
                                                                                        cursor: getEventProjectId(
                                                                                            evt
                                                                                        )
                                                                                            ? 'pointer'
                                                                                            : 'default'
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        evt.title
                                                                                    }
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    {more >
                                                                        0 && (
                                                                        <span
                                                                            className='calendar-year-more'
                                                                            title={`${more} more`}
                                                                        >
                                                                            +
                                                                            {
                                                                                more
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT: Reminders Section */}
            <div className='reminders-section'>
                <div className='reminders-header flex justify-between items-center'>
                    <h3 className='reminders-title'>
                        <Calendar size={20} className='text-blue-600' />{' '}
                        Reminders
                    </h3>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className='text-blue-600 hover:text-blue-800 p-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors'
                        title='Add Custom Reminder'
                    >
                        {showAddForm ? <X size={20} /> : <Plus size={20} />}
                    </button>
                </div>

                <div className='filters-bar justify-center border-b-0 pb-2'>
                    <button
                        className={`filter-btn text-xs py-1 px-3 ${reminderFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setReminderFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn text-xs py-1 px-3 ${reminderFilter === 'collections' ? 'active' : ''}`}
                        onClick={() => setReminderFilter('collections')}
                    >
                        Collections
                    </button>
                    <button
                        className={`filter-btn text-xs py-1 px-3 ${reminderFilter === 'customers' ? 'active' : ''}`}
                        onClick={() => setReminderFilter('customers')}
                    >
                        Customers
                    </button>
                </div>

                {showAddForm && (
                    <form
                        className='add-reminder-form'
                        onSubmit={handleAddReminder}
                    >
                        <div className='form-group'>
                            <label className='form-label'>Date</label>
                            <input
                                type='date'
                                className='form-input'
                                value={newReminder.date}
                                onChange={(e) =>
                                    setNewReminder({
                                        ...newReminder,
                                        date: e.target.value
                                    })
                                }
                                required
                            />
                        </div>
                        <div className='form-group'>
                            <label className='form-label'>Description</label>
                            <input
                                type='text'
                                className='form-input'
                                placeholder='Remind me to...'
                                value={newReminder.description}
                                onChange={(e) =>
                                    setNewReminder({
                                        ...newReminder,
                                        description: e.target.value
                                    })
                                }
                                required
                            />
                        </div>
                        <div className='form-actions mt-2'>
                            <button
                                type='button'
                                className='btn-save bg-gray-200 text-gray-800 hover:bg-gray-300'
                                onClick={() => setShowAddForm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                className='btn-save'
                                disabled={
                                    isSubmitting ||
                                    !newReminder.description.trim()
                                }
                            >
                                {isSubmitting ? 'Saving...' : 'Save Reminder'}
                            </button>
                        </div>
                    </form>
                )}

                <div className='reminders-list-container'>
                    {isLoadingReminders ? (
                        <div className='flex justify-center p-8'>
                            <Loader2
                                className='animate-spin text-blue-500'
                                size={24}
                            />
                        </div>
                    ) : reminders.length === 0 ? (
                        <div className='empty-state'>
                            No {reminderFilter !== 'all' ? reminderFilter : ''}{' '}
                            reminders found.
                        </div>
                    ) : (
                        reminders.map((rem) => (
                            <div
                                key={rem.id}
                                className={`reminder-item ${rem.reminder_type}`}
                            >
                                <div className='reminder-content'>
                                    <span className='reminder-date'>
                                        {format(
                                            new Date(rem.date),
                                            'MMM dd, yyyy'
                                        )}
                                    </span>
                                    <p className='reminder-desc'>
                                        {rem.description}
                                    </p>
                                    <span
                                        className={`reminder-badge ${rem.reminder_type}`}
                                    >
                                        {rem.reminder_type === 'system'
                                            ? '⚙️ System'
                                            : '✏️ Custom'}
                                    </span>
                                </div>
                                {rem.reminder_type === 'custom' && (
                                    <button
                                        className='btn-delete'
                                        onClick={() =>
                                            handleDeleteReminder(rem.id)
                                        }
                                        title='Delete Reminder'
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarReminders;
