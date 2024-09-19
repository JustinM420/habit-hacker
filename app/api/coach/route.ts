import prismadb from "@/lib/prismadb";
import { currentUser, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Request Body:", body);
        const user = await currentUser();
        const { name, description, instructions, seed } = body;

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if ( !name || !description || !instructions || !seed) {
            return new NextResponse("Missing Required Fields", { status: 400 });
        }

        const coach = await prismadb.coach.upsert({
            where: {
                userId: user.id,
            },
            update: {
                name,
                description,
                instructions,
                seed,
            },
            create: {
                userId: user.id,
                name,
                description,
                instructions,
                seed,
            },
        });

        return NextResponse.json(coach);
    } catch (error) {
        console.error('[COACH_PATCH]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

