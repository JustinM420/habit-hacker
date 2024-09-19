// app/coach/page.tsx

import prismadb from "@/lib/prismadb";
import { CoachForm } from "./components/coach-form";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const CoachPage = async () => {
  const user = await currentUser();

  if (!user) {
    // Redirect to sign-in page
    redirect("/sign-in");
  }

  // TODO: Check Subscription

  const coach = await prismadb.coach.findFirst({
    where: {
      userId: user.id,
    },
  });

  return (
    <CoachForm
      initialData={coach}
    />
  );
};

export default CoachPage;
