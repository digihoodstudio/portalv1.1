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
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-semibold text-white mb-2 flex items-center gap-3">
          <Calendar className="text-gold" /> Daily Planner
        </h1>
        <p className="text-foreground/60 mb-6">Plan your day and track progress.</p>

        <div className="rounded-2xl border border-white/10 bg-glass p-6 text-center">
          <svg width="120" height="120" className="mx-auto mb-4">
            <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="40"
              fill="none" stroke="#d4a853" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              className="transition-all duration-500"
            />
            <text x="60" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{targetPct}%</text>
            <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">{callsMade}/{callTarget}</text>
          </svg>
          <p className="text-xs text-white/50 mb-3">Daily Call Target</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                const t = Math.max(1, callTarget - 5);
                setCallTarget(t);
                localStorage.setItem('planner-target', String(t));
              }}
              className="rounded-lg bg-white/5 px-3 py-1 text-white/70 hover:bg-white/10"
            >-5</button>
            <span className="text-white font-bold">{callTarget}</span>
            <button
              onClick={() => {
                const t = callTarget + 5;
                setCallTarget(t);
                localStorage.setItem('planner-target', String(t));
              }}
              className="rounded-lg bg-white/5 px-3 py-1 text-white/70 hover:bg-white/10"
            >+5</button>
          </div>
          <button onClick={incrementCalls} className="mt-4 rounded-full bg-gold px-6 py-2 text-background font-bold text-sm hover:brightness-110">
            <Target size={14} className="inline mr-1" /> Log Call Made
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="text-gold" size={20} /> Tasks
        </h2>
        <div className="rounded-2xl border border-white/10 bg-glass p-6">
          <div className="flex gap-2 mb-4">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add a task..."
              className="flex-1 rounded-xl border border-white/10 bg-[#0c1433]/80 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50"
            />
            <button onClick={addTask} className="rounded-xl bg-gold px-4 text-background font-bold hover:brightness-110">
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2.5">
                <button onClick={() => toggleTask(task.id)}>
                  {task.completed
                    ? <CheckCircle2 size={16} className="text-emerald-400" />
                    : <Circle size={16} className="text-white/30" />
                  }
                </button>
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-white/30' : 'text-white'}`}>
                  {task.title}
                </span>
                <button onClick={() => deleteTask(task.id)} className="text-red-400/50 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-white/30 text-sm">No tasks yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
