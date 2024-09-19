import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

import DailyTaskList from "@/components/taskLists/DailyTaskList";
import WeeklyTaskList from "@/components/taskLists/WeeklyTaskList";
import MonthlyTaskList from "@/components/taskLists/MonthlyTaskList";
import TaskModalButton from "@/app/(root)/(routes)/list/components/taskModalButton";
import dayjs from "dayjs";

// Initialize Prisma Client
const prisma = new PrismaClient();

const ListPage = async () => {
  const today = dayjs().startOf("day").toDate();
  const tomorrow = dayjs().add(1, "day").startOf("day").toDate();

  const { userId } = auth(); // Ensure userId is extracted correctly

  if (!userId) {
    return <div>Please sign in to view your tasks.</div>;
  }

  const dailyTasks = await prisma.task.findMany({
    where: {
      userId: userId, // userId is now a string
      OR: [
        { frequency: "DAILY" },
        { recurring: true, frequency: "DAILY" },
        { specificDate: { gte: today, lt: tomorrow } },
      ],
    },
  });

  const weeklyTasks = await prisma.task.findMany({
    where: {
      userId: userId, // userId is now a string
      frequency: "WEEKLY",
    },
  });

  const monthlyTasks = await prisma.task.findMany({
    where: {
      userId: userId, // userId is now a string
      frequency: "MONTHLY",
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center p-4">
        <h1 className="text-3xl font-bold">Your Task Lists</h1>
        <TaskModalButton userId={userId} />
      </div>

      <DailyTaskList tasks={dailyTasks} />
      <WeeklyTaskList tasks={weeklyTasks} />
      <MonthlyTaskList tasks={monthlyTasks} />
    </div>
  );
};

export default ListPage;
