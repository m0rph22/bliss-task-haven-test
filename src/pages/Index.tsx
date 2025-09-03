import React, { useState } from 'react';
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

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setTasks([task, ...tasks]);
      setNewTask('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
              onClick={addTask}
              disabled={!newTask.trim()}
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
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <Card className="p-12 text-center gradient-surface border-0 shadow-lg">
              <div className="text-muted-foreground">
                <Circle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
                <p>Add your first task above to get started!</p>
              </div>
            </Card>
          ) : (
            tasks.map((task) => (
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
                    <p className={cn(
                      "text-base duration-300",
                      task.completed 
                        ? "line-through text-muted-foreground" 
                        : "text-foreground font-medium"
                    )}>
                      {task.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {task.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
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