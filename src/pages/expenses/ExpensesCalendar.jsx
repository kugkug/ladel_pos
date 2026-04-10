import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Bell,
    CheckCircle2,
    Circle,
    Edit,
    Trash2,
    Filter
} from 'lucide-react';
import { ExpensesContext } from '@/contexts/ExpensesContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import ReminderModal from '@/components/ReminderModal';

const ExpensesCalendar = () => {
    const { reminders, deleteReminder, markReminderAsCompleted } =
        useContext(ExpensesContext);
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    /** 'month' = single month grid; 'year' = 12 mini month grids for the selected year */
    const [calendarView, setCalendarView] = useState('month');
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        types: [],
        statuses: [],
        startDate: '',
        endDate: ''
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const handlePrev = () => {
        if (calendarView === 'year') {
            setCurrentDate(new Date(year - 1, month, 1));
        } else {
            setCurrentDate(new Date(year, month - 1, 1));
        }
    };
    const handleNext = () => {
        if (calendarView === 'year') {
            setCurrentDate(new Date(year + 1, month, 1));
        } else {
            setCurrentDate(new Date(year, month + 1, 1));
        }
    };

    const typeColors = {
        'Pay Slip': 'bg-blue-100 text-blue-700 border-blue-200',
        Rent: 'bg-green-100 text-green-700 border-green-200',
        Utilities: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Apps/Subscription': 'bg-purple-100 text-purple-700 border-purple-200',
        'Legal & Accounting': 'bg-orange-100 text-orange-700 border-orange-200',
        'Government benefits': 'bg-red-100 text-red-700 border-red-200',
        'Custom Reminder': 'bg-gray-100 text-gray-700 border-gray-200',
        Other: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    const toggleFilter = (category, value) => {
        setFilters((prev) => {
            const current = prev[category];
            const updated = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const clearFilters = () => {
        setFilters({ types: [], statuses: [], startDate: '', endDate: '' });
    };

    const getDayData = (day, monthIndex = month, y = year) => {
        const targetStr = `${y}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayRems = reminders.filter((r) => r.date === targetStr);
        return { dayRems, targetStr };
    };

    const handleCellClick = (dayStr) => {
        setSelectedDate(dayStr);
        setIsReminderModalOpen(true);
    };

    let filteredReminders = reminders;
    if (filters.types.length > 0)
        filteredReminders = filteredReminders.filter((r) =>
            filters.types.includes(r.type)
        );
    if (filters.statuses.length > 0)
        filteredReminders = filteredReminders.filter((r) =>
            filters.statuses.includes(r.status)
        );
    if (filters.startDate)
        filteredReminders = filteredReminders.filter(
            (r) => r.date >= filters.startDate
        );
    if (filters.endDate)
        filteredReminders = filteredReminders.filter(
            (r) => r.date <= filters.endDate
        );

    const pendingReminders = filteredReminders.filter(
        (r) => r.status === 'Pending'
    );
    const completedReminders = filteredReminders.filter(
        (r) => r.status === 'Completed'
    );
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueReminders = pendingReminders.filter((r) => r.date < todayStr);
    const activeFiltersCount =
        filters.types.length +
        filters.statuses.length +
        (filters.startDate ? 1 : 0) +
        (filters.endDate ? 1 : 0);

    return (
        <>
            <Helmet>
                <title>Calendar & Reminders</title>
            </Helmet>
            <div className='space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300'>
                {/* Content Block */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div>
                        <h1 className='text-3xl font-bold text-accent'>
                            Calendar & Reminders
                        </h1>
                        <p className='text-muted-foreground mt-1'>
                            Manage financial scheduled tasks and supplier
                            payments
                        </p>
                    </div>
                    <div className='flex flex-wrap items-center gap-3'>
                        <div className='flex rounded-lg border border-muted bg-muted/30 p-0.5 shadow-sm'>
                            <button
                                type='button'
                                onClick={() => setCalendarView('month')}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${calendarView === 'month' ? 'bg-white text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Month
                            </button>
                            <button
                                type='button'
                                onClick={() => setCalendarView('year')}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${calendarView === 'year' ? 'bg-white text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Year
                            </button>
                        </div>
                        <div className='flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-muted shadow-sm'>
                            <button
                                type='button'
                                onClick={handlePrev}
                                className='p-1 hover:bg-muted rounded text-muted-foreground transition-colors'
                                aria-label={
                                    calendarView === 'year'
                                        ? 'Previous year'
                                        : 'Previous month'
                                }
                            >
                                <ChevronLeft className='w-5 h-5' />
                            </button>
                            <span className='font-bold text-foreground min-w-[140px] md:min-w-[180px] text-center text-sm md:text-base'>
                                {calendarView === 'year'
                                    ? year
                                    : currentDate.toLocaleString('default', {
                                          month: 'long',
                                          year: 'numeric'
                                      })}
                            </span>
                            <button
                                type='button'
                                onClick={handleNext}
                                className='p-1 hover:bg-muted rounded text-muted-foreground transition-colors'
                                aria-label={
                                    calendarView === 'year'
                                        ? 'Next year'
                                        : 'Next month'
                                }
                            >
                                <ChevronRight className='w-5 h-5' />
                            </button>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingReminder(null);
                                setSelectedDate(null);
                                setIsReminderModalOpen(true);
                            }}
                            className='bg-primary hover:bg-primary/90 text-white shadow-md'
                        >
                            <Plus className='w-4 h-4 mr-2' /> Add Reminder
                        </Button>
                    </div>
                </div>

                <div className='bg-white rounded-2xl shadow-sm border border-muted overflow-hidden'>
                    {calendarView === 'month' ? (
                        <>
                            <div className='grid grid-cols-7 border-b border-muted bg-accent text-white'>
                                {[
                                    'Sun',
                                    'Mon',
                                    'Tue',
                                    'Wed',
                                    'Thu',
                                    'Fri',
                                    'Sat'
                                ].map((d) => (
                                    <div
                                        key={d}
                                        className='py-3 text-center text-xs font-semibold uppercase tracking-wider border-r last:border-r-0 border-muted/20'
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>
                            <div className='grid grid-cols-7 auto-rows-[120px]'>
                                {Array.from({ length: firstDayOfMonth }).map(
                                    (_, i) => (
                                        <div
                                            key={`empty-${i}`}
                                            className='border-r border-b border-muted bg-muted/10'
                                        ></div>
                                    )
                                )}
                                {Array.from({ length: daysInMonth }).map(
                                    (_, i) => {
                                        const day = i + 1;
                                        const { dayRems, targetStr } =
                                            getDayData(day);
                                        const isToday = targetStr === todayStr;

                                        return (
                                            <div
                                                key={day}
                                                className={`border-r border-b border-muted p-2 overflow-y-auto hover:bg-muted/30 transition-colors cursor-pointer group ${isToday ? 'bg-primary/5' : ''}`}
                                                onClick={() =>
                                                    handleCellClick(targetStr)
                                                }
                                            >
                                                <div className='flex justify-between items-start mb-1'>
                                                    <div
                                                        className={`font-medium text-sm w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white shadow-md' : 'text-foreground'}`}
                                                    >
                                                        {day}
                                                    </div>
                                                    {dayRems.length > 0 && (
                                                        <span className='text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center font-bold shadow-sm'>
                                                            <Bell className='w-2.5 h-2.5 mr-1' />
                                                            {dayRems.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className='space-y-1.5 mt-2'>
                                                    {dayRems
                                                        .slice(0, 3)
                                                        .map((rem, idx) => (
                                                            <div
                                                                key={`r-${idx}`}
                                                                className={`text-[10px] px-1.5 py-1 rounded-md border truncate flex items-center font-medium ${rem.status === 'Completed' ? 'opacity-50' : 'shadow-sm'} ${typeColors[rem.type] || typeColors['Other']}`}
                                                                title={
                                                                    rem.notes
                                                                }
                                                            >
                                                                <div
                                                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${rem.status === 'Completed' ? 'bg-gray-400' : rem.date < todayStr ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}
                                                                ></div>
                                                                {rem.type ===
                                                                'Custom Reminder'
                                                                    ? rem.customType ||
                                                                      'Custom'
                                                                    : rem.type}
                                                            </div>
                                                        ))}
                                                    {dayRems.length > 3 && (
                                                        <div className='text-[10px] text-muted-foreground font-semibold pl-1'>
                                                            +{' '}
                                                            {dayRems.length - 3}{' '}
                                                            more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </>
                    ) : (
                        <div className='p-4 md:p-6'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
                                {Array.from({ length: 12 }, (_, monthIndex) => {
                                    const dim = new Date(
                                        year,
                                        monthIndex + 1,
                                        0
                                    ).getDate();
                                    const fd = new Date(
                                        year,
                                        monthIndex,
                                        1
                                    ).getDay();
                                    const monthLabel = new Date(
                                        year,
                                        monthIndex,
                                        1
                                    ).toLocaleString('default', {
                                        month: 'long'
                                    });
                                    return (
                                        <div
                                            key={monthIndex}
                                            className='rounded-xl border border-muted bg-muted/5 overflow-hidden flex flex-col min-h-0'
                                        >
                                            <div className='px-3 py-2 bg-accent/90 text-white text-sm font-bold text-center border-b border-muted/20'>
                                                {monthLabel}
                                            </div>
                                            <div className='grid grid-cols-7 border-b border-muted/60 bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-tight'>
                                                {[
                                                    'S',
                                                    'M',
                                                    'T',
                                                    'W',
                                                    'T',
                                                    'F',
                                                    'S'
                                                ].map((d, idx) => (
                                                    <div
                                                        key={`${monthIndex}-wd-${idx}`}
                                                        className='py-1 text-center border-r last:border-r-0 border-muted/30'
                                                    >
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className='grid grid-cols-7 auto-rows-[minmax(1.75rem,auto)] flex-1 text-[11px]'>
                                                {Array.from({ length: fd }).map(
                                                    (_, i) => (
                                                        <div
                                                            key={`${monthIndex}-pad-${i}`}
                                                            className='border-r border-b border-muted/40 bg-muted/20'
                                                        />
                                                    )
                                                )}
                                                {Array.from({
                                                    length: dim
                                                }).map((_, i) => {
                                                    const day = i + 1;
                                                    const {
                                                        dayRems,
                                                        targetStr
                                                    } = getDayData(
                                                        day,
                                                        monthIndex,
                                                        year
                                                    );
                                                    const isToday =
                                                        targetStr === todayStr;
                                                    return (
                                                        <button
                                                            key={`${monthIndex}-d-${day}`}
                                                            type='button'
                                                            onClick={() =>
                                                                handleCellClick(
                                                                    targetStr
                                                                )
                                                            }
                                                            className={`border-r border-b border-muted/40 p-0.5 flex flex-col items-center justify-start gap-0.5 hover:bg-primary/10 transition-colors min-h-[1.75rem] ${isToday ? 'bg-primary/15 ring-1 ring-inset ring-primary/40' : ''}`}
                                                        >
                                                            <span
                                                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${isToday ? 'bg-primary text-white' : 'text-foreground'}`}
                                                            >
                                                                {day}
                                                            </span>
                                                            {dayRems.length >
                                                                0 && (
                                                                <span
                                                                    className='flex h-1 w-1 rounded-full bg-red-500'
                                                                    title={`${dayRems.length} reminder(s)`}
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Reminders List Section */}
                <div className='bg-white rounded-2xl border border-muted shadow-sm p-6 space-y-6'>
                    <div className='flex flex-col md:flex-row justify-between items-start md:items-center border-b border-muted pb-4 gap-4'>
                        <h2 className='text-xl font-bold flex items-center gap-2 text-accent'>
                            <Bell className='w-6 h-6 text-primary' /> Reminders
                            List
                        </h2>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setShowFilters(!showFilters)}
                            className={`border-muted ${activeFiltersCount > 0 ? 'bg-secondary/20 text-accent border-secondary' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            <Filter className='w-4 h-4 mr-2' /> Filters{' '}
                            {activeFiltersCount > 0 &&
                                `(${activeFiltersCount} active)`}
                        </Button>
                    </div>

                    {showFilters && (
                        <div className='bg-muted/10 p-5 rounded-xl border border-muted grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2'>
                            <div>
                                <h4 className='font-bold mb-3 text-sm text-accent border-b border-muted/50 pb-2'>
                                    Filter by Status
                                </h4>
                                <div className='flex flex-col gap-2'>
                                    {['Pending', 'Completed'].map((s) => (
                                        <label
                                            key={s}
                                            className='flex items-center gap-2 cursor-pointer text-sm text-foreground hover:text-primary transition-colors'
                                        >
                                            <Checkbox
                                                checked={filters.statuses.includes(
                                                    s
                                                )}
                                                onCheckedChange={() =>
                                                    toggleFilter('statuses', s)
                                                }
                                                className='border-muted data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                                            />{' '}
                                            {s}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className='font-bold mb-3 text-sm text-accent border-b border-muted/50 pb-2'>
                                    Filter by Type
                                </h4>
                                <div className='flex flex-col gap-2 max-h-32 overflow-y-auto'>
                                    {[
                                        'Utilities',
                                        'Rent',
                                        'Apps/Subscription',
                                        'Custom Reminder'
                                    ].map((t) => (
                                        <label
                                            key={t}
                                            className='flex items-center gap-2 cursor-pointer text-sm text-foreground hover:text-primary transition-colors'
                                        >
                                            <Checkbox
                                                checked={filters.types.includes(
                                                    t
                                                )}
                                                onCheckedChange={() =>
                                                    toggleFilter('types', t)
                                                }
                                                className='border-muted data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                                            />{' '}
                                            {t}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className='font-bold mb-3 text-sm text-accent border-b border-muted/50 pb-2'>
                                    Date Range
                                </h4>
                                <div className='space-y-3'>
                                    <div className='flex flex-col gap-1'>
                                        <span className='text-xs text-muted-foreground font-semibold'>
                                            From
                                        </span>
                                        <Input
                                            type='date'
                                            value={filters.startDate}
                                            onChange={(e) =>
                                                setFilters((p) => ({
                                                    ...p,
                                                    startDate: e.target.value
                                                }))
                                            }
                                            className='h-8 text-sm focus-visible:ring-primary'
                                        />
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <span className='text-xs text-muted-foreground font-semibold'>
                                            To
                                        </span>
                                        <Input
                                            type='date'
                                            value={filters.endDate}
                                            onChange={(e) =>
                                                setFilters((p) => ({
                                                    ...p,
                                                    endDate: e.target.value
                                                }))
                                            }
                                            className='h-8 text-sm focus-visible:ring-primary'
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='md:col-span-3 flex justify-end'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={clearFilters}
                                    className='text-muted-foreground hover:text-destructive'
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='space-y-3'>
                            <h3 className='font-bold text-destructive flex items-center justify-between border-b border-destructive/20 pb-2'>
                                Overdue{' '}
                                <span className='bg-destructive text-white px-2 py-0.5 rounded-full text-xs'>
                                    {overdueReminders.length}
                                </span>
                            </h3>
                            {overdueReminders.length === 0 && (
                                <p className='text-sm text-muted-foreground italic text-center py-4 bg-muted/10 rounded-lg border border-dashed border-muted'>
                                    No overdue reminders.
                                </p>
                            )}
                            <div className='space-y-3 max-h-[500px] overflow-y-auto pr-1'>
                                {overdueReminders.map((r) => (
                                    <ReminderCard
                                        key={r.id}
                                        r={r}
                                        onEdit={setEditingReminder}
                                        onComplete={markReminderAsCompleted}
                                        onDelete={deleteReminder}
                                        colors={typeColors}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className='space-y-3'>
                            <h3 className='font-bold text-primary flex items-center justify-between border-b border-primary/20 pb-2'>
                                Pending{' '}
                                <span className='bg-primary text-white px-2 py-0.5 rounded-full text-xs'>
                                    {pendingReminders.length -
                                        overdueReminders.length}
                                </span>
                            </h3>
                            {pendingReminders.length -
                                overdueReminders.length ===
                                0 && (
                                <p className='text-sm text-muted-foreground italic text-center py-4 bg-muted/10 rounded-lg border border-dashed border-muted'>
                                    No pending reminders.
                                </p>
                            )}
                            <div className='space-y-3 max-h-[500px] overflow-y-auto pr-1'>
                                {pendingReminders
                                    .filter((r) => r.date >= todayStr)
                                    .map((r) => (
                                        <ReminderCard
                                            key={r.id}
                                            r={r}
                                            onEdit={setEditingReminder}
                                            onComplete={markReminderAsCompleted}
                                            onDelete={deleteReminder}
                                            colors={typeColors}
                                        />
                                    ))}
                            </div>
                        </div>
                        <div className='space-y-3'>
                            <h3 className='font-bold text-green-600 flex items-center justify-between border-b border-green-600/20 pb-2'>
                                Completed{' '}
                                <span className='bg-green-600 text-white px-2 py-0.5 rounded-full text-xs'>
                                    {completedReminders.length}
                                </span>
                            </h3>
                            {completedReminders.length === 0 && (
                                <p className='text-sm text-muted-foreground italic text-center py-4 bg-muted/10 rounded-lg border border-dashed border-muted'>
                                    No completed reminders.
                                </p>
                            )}
                            <div className='space-y-3 max-h-[500px] overflow-y-auto pr-1'>
                                {completedReminders.map((r) => (
                                    <ReminderCard
                                        key={r.id}
                                        r={r}
                                        onEdit={setEditingReminder}
                                        onComplete={markReminderAsCompleted}
                                        onDelete={deleteReminder}
                                        colors={typeColors}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ReminderModal
                isOpen={isReminderModalOpen || !!editingReminder}
                onClose={() => {
                    setIsReminderModalOpen(false);
                    setEditingReminder(null);
                    setSelectedDate(null);
                }}
                reminder={editingReminder}
                selectedDate={selectedDate}
            />
        </>
    );
};

const ReminderCard = ({ r, onEdit, onComplete, onDelete, colors }) => {
    const isCompleted = r.status === 'Completed';
    return (
        <div
            className={`p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${isCompleted ? 'bg-muted/30 border-muted opacity-80' : 'bg-white border-muted/50'}`}
        >
            <div className='flex justify-between items-start'>
                <div className='flex items-start gap-3'>
                    <button
                        onClick={() => !isCompleted && onComplete(r.id)}
                        disabled={isCompleted}
                        className='text-muted-foreground hover:text-green-500 transition-colors mt-0.5'
                    >
                        {isCompleted ? (
                            <CheckCircle2 className='w-5 h-5 text-green-500' />
                        ) : (
                            <Circle className='w-5 h-5' />
                        )}
                    </button>
                    <div>
                        <span
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider ${colors[r.type] || colors['Other']}`}
                        >
                            {r.type === 'Custom Reminder'
                                ? r.customType || r.type
                                : r.type}
                        </span>
                        <p
                            className={`text-sm font-bold mt-2 ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                        >
                            {r.date}{' '}
                            {r.time && (
                                <span className='text-muted-foreground font-medium ml-1'>
                                    • {r.time}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className='flex gap-1 bg-muted/20 p-1 rounded-lg'>
                    <button
                        onClick={() => onEdit(r)}
                        className='p-1 text-muted-foreground hover:text-primary rounded hover:bg-white'
                    >
                        <Edit className='w-3.5 h-3.5' />
                    </button>
                    <button
                        onClick={() =>
                            window.confirm('Delete this reminder?') &&
                            onDelete(r.id)
                        }
                        className='p-1 text-muted-foreground hover:text-destructive rounded hover:bg-white'
                    >
                        <Trash2 className='w-3.5 h-3.5' />
                    </button>
                </div>
            </div>
            {r.notes && (
                <p className='text-xs text-muted-foreground mt-3 bg-muted/10 p-2 rounded border border-muted/50'>
                    {r.notes}
                </p>
            )}
            <div className='mt-3 text-[10px] text-muted-foreground font-bold tracking-widest uppercase flex items-center gap-1.5'>
                <div className='w-1 h-1 rounded-full bg-muted-foreground'></div>{' '}
                {r.frequency}
            </div>
        </div>
    );
};

export default ExpensesCalendar;
