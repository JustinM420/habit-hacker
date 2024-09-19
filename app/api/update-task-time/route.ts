import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { taskId, specificTime } = body;

    if (!taskId || !specificTime) {
      return new NextResponse("Missing task ID or specific time", { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { specificTime },
    });

    return NextResponse.json({ message: "Time updated successfully", updatedTask });
  } catch (error) {
    console.error("Error updating time:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
