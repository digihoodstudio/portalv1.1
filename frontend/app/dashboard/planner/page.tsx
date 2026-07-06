'use client';
import { useState, useEffect } from 'react';
import { Calendar, Target, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [callTarget, setCallTarget] = useState(20);
  const [callsMade, setCallsMade] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('planner-tasks');
    if (saved) setTasks(JSON.parse(saved));
    const savedTarget = localStorage.getItem('planner-target');
    if (savedTarget) setCallTarget(parseInt(savedTarget));
    const savedMade = localStorage.getItem('planner-calls-made');
    if (savedMade) setCallsMade(parseInt(savedMade));
  }, []);

  const saveTasks = (t: Task[]) => {
    setTasks(t);
    localStorage.setItem('planner-tasks', JSON.stringify(t));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    saveTasks([...tasks, { id: Date.now().toString(), title: newTask, completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const incrementCalls = () => {
    const next = Math.min(callsMade + 1, callTarget);
    setCallsMade(next);
    localStorage.setItem('planner-calls-made', String(next));
  };

  const targetPct = callTarget > 0 ? Math.round((callsMade / callTarget) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (targetPct / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-heading flex items-center gap-2">
            <Calendar className="text-gold" size={22} /> Daily Planner
          </h1>
          <p className="text-sm text-foreground/60 mt-1">Plan your day and track progress.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="rounded-2xl border border-white/10 bg-surface p-6 flex flex-col items-center text-center">
          <svg width="120" height="120" className="mb-3">
            <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="40"
              fill="none" stroke="#D1C9BC" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              className="transition-all duration-500"
            />
            <text x="60" y="52" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{targetPct}%</text>
            <text x="60" y="66" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10">{callsMade}/{callTarget}</text>
          </svg>
          <p className="text-xs uppercase tracking-wider text-heading/50 mb-4">Daily Call Target</p>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => {
                const t = Math.max(1, callTarget - 5);
                setCallTarget(t);
                localStorage.setItem('planner-target', String(t));
              }}
              className="h-8 w-8 rounded-full border border-white/10 bg-white/5 text-heading/60 hover:text-heading hover:bg-white/10 transition flex items-center justify-center text-sm font-bold"
            >−</button>
            <span className="text-2xl font-bold text-heading tabular-nums">{callTarget}</span>
            <button
              onClick={() => {
                const t = callTarget + 5;
                setCallTarget(t);
                localStorage.setItem('planner-target', String(t));
              }}
              className="h-8 w-8 rounded-full border border-white/10 bg-white/5 text-heading/60 hover:text-heading hover:bg-white/10 transition flex items-center justify-center text-sm font-bold"
            >+</button>
          </div>
          <button onClick={incrementCalls} className="w-full rounded-full bg-gold py-2.5 text-sm font-bold text-background hover:brightness-110 transition flex items-center justify-center gap-1.5">
            <Target size={14} /> Log Call Made
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface p-6">
          <h2 className="text-sm font-semibold text-heading mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-gold" size={16} /> Tasks
            {tasks.length > 0 && <span className="text-xs text-heading/30 font-normal ml-auto">{tasks.filter(t => t.completed).length}/{tasks.length}</span>}
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add a task..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-heading placeholder-white/30 outline-none focus:border-gold/50 transition"
            />
            <button onClick={addTask} className="rounded-xl bg-gold px-4 text-background font-bold hover:brightness-110 transition flex items-center justify-center">
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-2.5 hover:bg-white/[0.06] transition group">
                <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                  {task.completed
                    ? <CheckCircle2 size={16} className="text-emerald-400" />
                    : <Circle size={16} className="text-heading/20 group-hover:text-heading/40 transition" />
                  }
                </button>
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-heading/30' : 'text-heading/80'}`}>
                  {task.title}
                </span>
                <button onClick={() => deleteTask(task.id)} className="text-red-400/30 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-heading/30 text-sm text-center py-8">No tasks yet. Add one above.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
