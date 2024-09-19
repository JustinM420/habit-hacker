import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    const { taskId, completed } = await req.json();

    // Validate input
    if (typeof taskId !== 'number' || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Fetch the current task to get the existing completedAt array
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    let newCompletedAt = existingTask.completedAt;

    if (completed) {
      // Add the current date to the array if the task is marked as completed
      newCompletedAt.push(new Date());
    } else {
      // Optionally: Remove the last completion date when unmarking (or handle it differently)
      newCompletedAt = newCompletedAt.slice(0, -1); // This removes the last entry
    }

    // Update the task's completed status and completedAt array
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        completed,
        completedAt: newCompletedAt,
      },
    });

    // Return the updated task
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
  }
}
