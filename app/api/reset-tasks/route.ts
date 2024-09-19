import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

export async function GET() {
  const today = dayjs();
  const isFirstDayOfWeek = today.day() === 1; // Monday as the first day of the week
  const isFirstDayOfMonth = today.date() === 1; // 1st day of the month

  try {
    // Handle Daily Tasks
    await prisma.task.updateMany({
      where: {
        completed: true,
        frequency: "DAILY",
      },
      data: {
        completionCount: { increment: 1 },
        completed: false,
      },
    });

    // Handle Weekly Tasks
    if (isFirstDayOfWeek) {
      await prisma.task.updateMany({
        where: {
          completed: true,
          frequency: "WEEKLY",
        },
        data: {
          completionCount: { increment: 1 },
          completed: false,
        },
      });

      await prisma.task.updateMany({
        where: {
          completed: false,
          frequency: "WEEKLY",
        },
        data: {
          missedCount: { increment: 1 },
        },
      });
    }

    // Handle Monthly Tasks
    if (isFirstDayOfMonth) {
      await prisma.task.updateMany({
        where: {
          completed: true,
          frequency: "MONTHLY",
        },
        data: {
          completionCount: { increment: 1 },
          completed: false,
        },
      });

      await prisma.task.updateMany({
        where: {
          completed: false,
          frequency: "MONTHLY",
        },
        data: {
          missedCount: { increment: 1 },
        },
      });
    }

    // Archive tasks without frequency
    await prisma.task.updateMany({
      where: {
        completed: true,
        frequency: null,
      },
      data: {
        archived: true,
      },
    });

    console.log("Task reset, archiving, and missed count increment complete");
    return NextResponse.json({ message: "Task reset and archiving complete" });
  } catch (error) {
    console.error("Error resetting tasks:", error);
    return NextResponse.json({ error: "Failed to reset tasks" }, { status: 500 });
  }
}
