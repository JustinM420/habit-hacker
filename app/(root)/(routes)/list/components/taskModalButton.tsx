"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddTaskForm } from "@/app/(root)/(routes)/list/components/taskForm";

type TaskModalButtonProps = {
  userId: string;
};

const TaskModalButton = ({ userId }: TaskModalButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div>
      <Button onClick={handleOpenModal} className="bg-primary/10 text-white">
        Add New Task
      </Button>

      <AddTaskForm isOpen={isModalOpen} onClose={handleCloseModal} userId={userId} />
    </div>
  );
};

export default TaskModalButton;
