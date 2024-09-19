import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server"; // Import the auth function

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { title, description, frequency, specificDate, specificTime, recurring } = await req.json();

    // Get the userId from the auth function
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "User is not authenticated" }, { status: 401 });
    }

    if (!title || !frequency) {
      return NextResponse.json({ error: "Title and Frequency are required" }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        frequency: frequency || null,
        specificDate: specificDate ? new Date(specificDate) : null,
        specificTime: specificTime || null,
        recurring: recurring || false,
        completed: false,
        userId: userId, // Use the actual user ID from auth
      },
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error("Error adding task:", error);
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 });
  }
}
