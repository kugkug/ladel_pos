import React from 'react';
import { Helmet } from 'react-helmet';
import CalendarReminders from '@/components/CalendarReminders';

const CalendarPage = () => {
  return (
    <>
      <Helmet>
        <title>Calendar & Reminders - Pipeline</title>
        <meta name="description" content="Manage your project deadlines and custom reminders." />
      </Helmet>

      <div className="calendar-page-container animate-in fade-in duration-300">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Calendar & Reminders</h1>
          <p className="text-gray-500 mt-1">Track paid projects, upcoming collections, and custom reminders.</p>
        </div>
        
        <CalendarReminders />
      </div>
    </>
  );
};

export default CalendarPage;