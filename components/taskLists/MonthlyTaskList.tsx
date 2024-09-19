"use client";

import React, { useState } from "react";
import { Task } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"; 
import { ChevronDown, ChevronUp } from "lucide-react";

const MonthlyTaskList = ({ tasks: initialTasks }: { tasks: Task[] }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [taskTimes, setTaskTimes] = useState<{ [key: number]: string | null }>({});
  const [editingTask, setEditingTask] = useState<number | null>(null);

  // Helper function to format the time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleTimeChange = (taskId: number, newTime: string) => {
    setTaskTimes({
      ...taskTimes,
      [taskId]: newTime,
    });
  };

  const handleSaveTime = async (taskId: number) => {
    const newTime = taskTimes[taskId];
    if (newTime) {
      try {
        const response = await fetch('/api/update-task-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId,
            specificTime: newTime,
          }),
        });
  
        if (response.ok) {
          const { updatedTask } = await response.json();
  
          // Update the tasks state with the updated task
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === updatedTask.id ? { ...task, specificTime: updatedTask.specificTime } : task
            )
          );
  
          setEditingTask(null); // Close the time editor after saving
        } else {
          console.error("Failed to update the time");
        }
      } catch (error) {
        console.error("Failed to save the time:", error);
      }
    }
  };
  

  const handleEditClick = (taskId: number) => {
    setEditingTask(editingTask === taskId ? null : taskId);
  };

  const handleCheckboxChange = async (taskId: number, currentStatus: boolean) => {
    console.log('Checkbox clicked', taskId, currentStatus); // Debug log
    try {
      const response = await fetch('/api/update-task-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          completed: !currentStatus,
        }),
      });
  
      if (response.ok) {
        const updatedTask = await response.json();
        console.log('Task updated successfully', updatedTask); // Debug log
  
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, completed: !currentStatus } : task
          )
        );
      } else {
        console.error('Failed to update task status', await response.text());
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Monthly Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={cn(
                "border border-gray-200 rounded-lg",
                "bg-primary/10 hover:bg-primary/20 transition-colors"
              )}
            >
              <Collapsible>
                <div className="flex items-center justify-between p-4">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => handleCheckboxChange(task.id, task.completed)}
                />
                  <span className="text-lg font-semibold flex-1 text-center">
                    {task.title}
                  </span>
                  <CollapsibleTrigger asChild>
                    <button>
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="p-4 pt-0 space-y-2">
                  <p className="text-primary">
                    Description: {task.description || "No description provided"}
                  </p>
                  <div className="text-primary flex items-center">
                    Time:{" "}
                    {editingTask === task.id ? (
                      <>
                        <input
                          type="time"
                          value={taskTimes[task.id] || ""}
                          onChange={(e) => handleTimeChange(task.id, e.target.value)}
                          className="border border-primary rounded p-1 ml-2"
                        />
                        <Button
                          onClick={() => handleSaveTime(task.id)}
                          className="ml-2"
                          variant="destructive"
                        >
                          Save
                        </Button>
                        <button onClick={() => handleEditClick(task.id)}>
                          <ChevronUp className="h-5 w-5 ml-2" />
                        </button>
                      </>
                    ) : task.specificTime ? (
                      <>
                        <span className="ml-2">{formatTime(task.specificTime)}</span>
                        <button onClick={() => handleEditClick(task.id)}>
                          <ChevronDown className="h-5 w-5 ml-2" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="ml-2">Set Time</span>
                        <button onClick={() => handleEditClick(task.id)}>
                          <ChevronDown className="h-5 w-5 ml-2" />
                        </button>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default MonthlyTaskList;
