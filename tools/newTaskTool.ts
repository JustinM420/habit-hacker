// tools/newTaskTool.ts

import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { PrismaClient, Frequency } from "@prisma/client"; // Import Frequency enum from Prisma
import { auth } from "@clerk/nextjs/server";

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Zod schema for validating the input to the add_task tool.
 */
const addTaskSchema = z.object({
  title: z.string().describe("Title of the task"),
  description: z.string().optional().describe("Description of the task"),
  frequency: z
    .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
    .optional()
    .describe("Frequency of the task (DAILY, WEEKLY, MONTHLY, YEARLY)"),
  specificDate: z
    .string()
    .optional()
    .describe("Specific date for the task in ISO format (YYYY-MM-DD)"),
  specificTime: z.string().optional().describe("Specific time for the task (HH:MM)"),
  recurring: z.boolean().optional().describe("Whether the task is recurring"),
});

/**
 * Helper function to map input string to Frequency enum.
 * Throws an error if the input is invalid.
 * @param value - The input frequency string.
 * @returns Frequency enum value or null.
 */
const mapStringToFrequency = (value: string | undefined): Frequency | null => {
  if (!value) return null;
  const upperValue = value.toUpperCase();
  if (Object.values(Frequency).includes(upperValue as Frequency)) {
    return upperValue as Frequency;
  }
  throw new Error(`Invalid frequency value: ${value}`);
};

/**
 * Custom tool to add a new task for the authenticated user.
 */
const addTaskTool = tool(
  /**
   * The tool function that adds a task to the database.
   * @param params - The parameters for adding a task.
   * @returns A success message string.
   */
  async ({
    title,
    description,
    frequency,
    specificDate,
    specificTime,
    recurring,
  }: z.infer<typeof addTaskSchema>) => {
    // Authenticate the user and get the userId
    const { userId } = auth();

    if (!userId) {
      throw new Error("User is not authenticated");
    }

    if (!title) {
      throw new Error("Title is required to add a task");
    }

    // Map the frequency string to the Frequency enum
    let frequencyEnumValue: Frequency | null = null;
    if (frequency) {
      frequencyEnumValue = mapStringToFrequency(frequency);
    }

    // Parse specificDate to Date object if provided
    let parsedDate: Date | null = null;
    if (specificDate) {
      const date = new Date(specificDate);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid specificDate format. Use YYYY-MM-DD.");
      }
      parsedDate = date;
    }

    // Optional: Validate specificTime format (HH:MM)
    if (specificTime) {
      const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(specificTime)) {
        throw new Error("Invalid specificTime format. Use HH:MM.");
      }
    }

    try {
      // Create a new task in the database
      const newTask = await prisma.task.create({
        data: {
          title,
          description: description || null,
          frequency: frequencyEnumValue,
          specificDate: parsedDate,
          specificTime: specificTime || null,
          recurring: recurring || false,
          completed: false,
          userId: userId,
        },
      });

      return `Task "${newTask.title}" added successfully.`;
    } catch (error) {
      console.error("Error adding task:", error);
      throw new Error("Failed to add task");
    }
  },
  {
    name: "add_task",
    description: "Adds a new task to the user's task list.",
    schema: addTaskSchema,
  }
);

export { addTaskTool };
