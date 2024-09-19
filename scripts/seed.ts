const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
    try {
        const users = [
            { email: "user1@example.com", name: "User One" },
            { email: "user2@example.com", name: "User Two" },
        ];

        const createdUsers = [];

        for (const user of users) {
            const createdUser = await db.user.create({
                data: user,
            });
            createdUsers.push(createdUser);
        }

        const tasks = [
            {
                title: "Daily Task Example",
                description: "This is a daily recurring task.",
                frequency: "DAILY", // Ensure this matches your enum value
                userId: createdUsers[0].id,
                recurring: true, // Changed from isRecurring to recurring
                specificDate: null,
                specificTime: "08:00",
                completedAt: null,
            },
            {
                title: "Weekly Task Example",
                description: "This is a weekly recurring task.",
                frequency: "WEEKLY", // Ensure this matches your enum value
                userId: createdUsers[0].id,
                recurring: true, // Changed from isRecurring to recurring
                specificDate: null,
                specificTime: "09:00",
                completedAt: null,
            },
            {
                title: "Monthly Task Example",
                description: "This is a monthly recurring task.",
                frequency: "MONTHLY", // Ensure this matches your enum value
                userId: createdUsers[1].id,
                recurring: true, // Changed from isRecurring to recurring
                specificDate: null,
                specificTime: "10:00",
                completedAt: null,
            },
            {
                title: "One-off Task Example",
                description: "This is a one-off task with a specific date.",
                frequency: null,
                userId: createdUsers[1].id,
                recurring: false, // Changed from isRecurring to recurring
                specificDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                specificTime: "11:00",
                completedAt: null,
            },
        ];

        for (const task of tasks) {
            await db.task.create({
                data: task,
            });
        }

    } catch (error) {
        console.error("Error seeding tasks", error);
    } finally {
        await db.$disconnect();
    }
}

main();
