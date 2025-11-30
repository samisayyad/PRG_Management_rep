import { useState, useEffect, useRef } from 'react';
import { timeEntriesAPI, tasksAPI } from '../services/api';
import {
  Play,
  Pause,
  Clock,
  Calendar,
  Target,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

export default function TimeTracking() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchData();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const fetchData = async () => {
    try {
      const [tasksRes, entriesRes] = await Promise.all([
        tasksAPI.list(),
        timeEntriesAPI.list(),
      ]);
      setTasks(tasksRes.data);
      setTimeEntries(entriesRes.data);
      
      const running = entriesRes.data.find((e) => e.is_running);
      if (running) {
        setActiveEntry(running);
        setIsRunning(true);
        setSelectedTask(running.task?.toString() || '');
        setDescription(running.description || '');
        const startTime = new Date(running.start_time);
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const handleStart = async () => {
    try {
      const response = await timeEntriesAPI.create({
        task: selectedTask || null,
        description,
        start_time: new Date().toISOString(),
        is_running: true,
      });
      setActiveEntry(response.data);
      setIsRunning(true);
      setElapsedTime(0);
    } catch (error) {
      console.error('Failed to start timer:', error);
    }
  };

  const handleStop = async () => {
    if (!activeEntry) return;
    
    try {
      await timeEntriesAPI.stop(activeEntry.id);
      setIsRunning(false);
      setActiveEntry(null);
      setElapsedTime(0);
      setSelectedTask('');
      setDescription('');
      fetchData();
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await timeEntriesAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const todayEntries = timeEntries.filter((e) => {
    const entryDate = new Date(e.start_time);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  });

  const todayTotal = todayEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
  const weekTotal = timeEntries.reduce((acc, e) => acc + (e.duration_seconds || 0), 0);
  const sessionsToday = todayEntries.length;
  const tasksTracked = new Set(timeEntries.filter(e => e.task).map(e => e.task)).size;

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
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-500">Track time spent on tasks and projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Active Timer</h2>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
                {formatTime(elapsedTime)}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Task</label>
                <div className="relative">
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    disabled={isRunning}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Choose a task to track</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isRunning}
                  placeholder="What are you working on?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                />
              </div>
            </div>

            <button
              onClick={isRunning ? handleStop : handleStart}
              className={`w-full py-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                isRunning
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop Timer
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Timer
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Time Entries</h3>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">View All</a>
            </div>

            {timeEntries.length > 0 ? (
              <div className="space-y-3">
                {timeEntries.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {entry.task_title || entry.description || 'No description'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(entry.start_time), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-900">
                        {entry.is_running ? 'Running...' : formatDuration(entry.duration_seconds)}
                      </span>
                      {!entry.is_running && (
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No time entries yet. Start tracking to see your history.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Today's Summary</h3>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Hours Worked</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(todayTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessionsToday}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tasks Tracked</p>
                <p className="text-2xl font-bold text-green-600">{tasksTracked}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">This Week</h3>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(weekTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Daily Average</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(Math.floor(weekTotal / 7))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Goal Progress (40h/week)</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min((weekTotal / (40 * 3600)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round((weekTotal / (40 * 3600)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
