import { useState, useEffect } from 'react';
import { analyticsAPI, tasksAPI } from '../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Grid3X3,
  List,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  useEffect(() => {
    fetchCalendarTasks();
  }, [currentDate]);

  const fetchCalendarTasks = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const response = await analyticsAPI.getCalendarTasks(month, year);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch calendar tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = monthStart.getDay();
  const paddingDays = Array.from({ length: startDay }, (_, i) => null);

  const getTasksForDay = (day) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), day);
    });
  };

  const unscheduledTasks = tasks.filter((task) => !task.due_date);
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date();
  });
  const dueSoonTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === 'done') return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= weekFromNow;
  });

  const today = new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500">View and manage tasks by due date</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-gray-50 py-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {paddingDays.map((_, index) => (
                <div key={`padding-${index}`} className="bg-gray-50 min-h-[100px]" />
              ))}
              
              {daysInMonth.map((day) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, today);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`bg-white min-h-[100px] p-2 ${
                      isToday ? 'ring-2 ring-blue-500 ring-inset' : ''
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                      isToday ? 'bg-blue-500 text-white font-medium' : 'text-gray-700'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`px-2 py-1 rounded text-xs truncate ${
                            task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            task.status === 'done' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Unscheduled Tasks</h3>
            </div>
            {unscheduledTasks.length > 0 ? (
              <div className="space-y-2">
                {unscheduledTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="p-2 bg-orange-50 rounded-lg text-sm text-orange-700">
                    {task.title}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">All tasks are scheduled</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed this month</span>
                <span className="font-medium">{tasks.filter(t => t.status === 'done').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="font-medium text-red-600">{overdueTasks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Due this week</span>
                <span className="font-medium text-orange-600">{dueSoonTasks.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Due Soon</h3>
            </div>
            {dueSoonTasks.length > 0 ? (
              <div className="space-y-2">
                {dueSoonTasks.map((task) => (
                  <div key={task.id} className="p-2 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      Due {format(new Date(task.due_date), 'MMM d')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
