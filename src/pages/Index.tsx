import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [displayTotalCount, setDisplayTotalCount] = useState(0);
  const [displayCompletedCount, setDisplayCompletedCount] = useState(0);
  const [addLocked, setAddLocked] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const leakRefs = useRef<{ handler: (e: Event) => void; data: string }[]>([]);

  // Load from localStorage on mount: only task names are stored
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tasks:names');
      if (raw) {
        const names: string[] = JSON.parse(raw);
        const restored: Task[] = names.map((name, index) => ({
          id: `${Date.now()}-${index}`,
          text: name,
          completed: false,
          createdAt: new Date(),
        }));
        setTasks(restored);
        // Do not restore display counters for progress; start fresh
        setDisplayTotalCount(0);
        setDisplayCompletedCount(0);
      }
    } catch (err) {
      // ignore storage errors
    }
  }, []);

  // Persist only task names whenever tasks list changes
  useEffect(() => {
    try {
      const names = tasks.map(t => t.text);
      localStorage.setItem('tasks:names', JSON.stringify(names));
    } catch (err) {
      // ignore storage errors
    }
  }, [tasks]);

  // Execute any <script> tags that were inserted via innerHTML in task text
  useEffect(() => {
    if (!listRef.current) return;
    const scriptNodes = listRef.current.querySelectorAll('script');
    scriptNodes.forEach((oldScript) => {
      const newScript = document.createElement('script');
      // Copy attributes
      for (let i = 0; i < oldScript.attributes.length; i++) {
        const attr = oldScript.attributes[i];
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [tasks]);

  const addTask = (text?: string, shouldClear: boolean = true) => {
    const taskText = text !== undefined ? text : newTask;
    const task: Task = {
      id: Date.now().toString(),
      text: taskText,
      completed: false,
      createdAt: new Date(),
    };
    setTasks((prev) => [task, ...prev]);
    // Always increment total count
    setDisplayTotalCount((prev) => prev + 1);
    // If all tasks were completed before adding, keep progress at 100%
    setDisplayCompletedCount((prevCompleted) => {
      return displayTotalCount > 0 && prevCompleted === displayTotalCount
        ? prevCompleted + 1
        : prevCompleted;
    });
    if (shouldClear) {
      setNewTask('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      return prev.map(task => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          setDisplayCompletedCount((prevCompleted) => prevCompleted + (nextCompleted ? 1 : -1));
          return { ...task, completed: nextCompleted };
        }
        return task;
      });
    });

    // Intentionally create a new listener and allocate data on every toggle without cleanup
    const handler = (e: Event) => {
      // no-op; retain closure references
      void e;
    };
    window.addEventListener('leaky-event', handler as EventListener);
    const data = new Array(50000).fill('leak').join('-');
    leakRefs.current.push({ handler, data });
  };

  const deleteTask = (index: number) => {
    // Intentionally use an index captured at render time (can be outdated)
    // and do not update displayTotalCount or displayCompletedCount
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const completedCount = displayCompletedCount;
  const totalCount = displayTotalCount;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Lock the Add button once progress reaches 100% and never unlock
  useEffect(() => {
    if (percent === 100 && !addLocked) {
      setAddLocked(true);
    }
  }, [percent, addLocked]);

  return (
    <div className="min-h-screen py-8 bg-gray-50 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            My Tasks
          </h1>
          <p className="text-lg text-muted-foreground">
            Stay organized and get things done
          </p>
          {totalCount > 0 && (
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-muted-foreground" />
                <span>{totalCount - completedCount} remaining</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>{completedCount} completed</span>
              </div>
            </div>
          )}
        </div>

        {/* Add Task Form */}
        <Card className="p-6 mb-8 gradient-surface border-0 shadow-xl glow-primary">
          <div className="flex gap-3">
            <Input
              placeholder="What needs to be done?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={() => addTask()}
              onDoubleClick={() => {
                const currentText = newTask;
                addTask(currentText, false);
                addTask(currentText, true);
              }}
              tabIndex={-1}
              disabled={addLocked}
              className="px-6 h-12"
              variant="secondary"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-8 p-6 gradient-surface border-0 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{percent}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className='h-full bg-black duration-700 ease-out'
              style={{ width: `${percent}%` }}
            />
          </div>
        </Card>

        {/* Task List */}
        <div className="space-y-3" ref={listRef}>
          {tasks.length === 0 ? (
            <Card className="p-12 text-center gradient-surface border-0 shadow-lg">
              <div className="text-muted-foreground">
                <Circle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
                <p>Add your first task above to get started!</p>
              </div>
            </Card>
          ) : (
            tasks.map((task, index) => (
              <Card
                key={task.id}
                className={cn(
                  "p-4 border-0 shadow-lg duration-300 task-enter glow-hover",
                  task.completed 
                    ? "bg-success/10 border-success/20" 
                    : "gradient-surface"
                )}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className={task.completed ? "task-complete" : ""}
                  />
                  <div className="flex-1">
                    <div
                      className={cn(
                        "text-base duration-300 whitespace-nowrap overflow-visible",
                        task.completed 
                          ? "line-through text-muted-foreground" 
                          : "text-foreground font-medium"
                      )}
                      dangerouslySetInnerHTML={{ __html: task.text }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.createdAt.toLocaleDateString('en-US', { timeZone: 'UTC' })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;