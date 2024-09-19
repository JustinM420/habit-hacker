"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import * as z from "zod";

// Define the form schema using Zod
const taskFormSchema = z.object({
    title: z.string().min(1, { message: "Title is required." }),
    description: z.string().optional(),
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "ONE_OFF"]),
    specificDate: z.string().optional(), // Make specificDate optional initially
    specificTime: z.string().optional(),
  }).refine((data) => {
    // Conditional validation: if frequency is "ONE_OFF", specificDate must be provided
    if (data.frequency === "ONE_OFF") {
      return !!data.specificDate;
    }
    return true;
  }, {
    message: "Specific date is required for One-Off tasks.",
    path: ["specificDate"], // This will attach the error to the specificDate field
  });

type TaskFormValues = z.infer<typeof taskFormSchema>;

type AddTaskFormProps = {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
  };

export const AddTaskForm = ({
  isOpen,
  onClose,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}) => {
    const form = useForm<z.infer<typeof taskFormSchema>>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
          title: "",
          description: "",
          frequency: "DAILY",
          specificDate: "",
          specificTime: "",
        },
    });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: TaskFormValues) => {
    const recurring = values.frequency !== "ONE_OFF"; // Set recurring based on frequency

    try {
      const response = await fetch("/api/add-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          userId,
          recurring, // Include the recurring field
        }),
      });

      if (response.ok) {
        window.location.reload(); // Refresh the page on success
      } else {
        console.error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new task to your list.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                name="frequency"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="DAILY" id="daily" />
                            <Label htmlFor="daily">Daily</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="WEEKLY" id="weekly" />
                            <Label htmlFor="weekly">Weekly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="MONTHLY" id="monthly" />
                            <Label htmlFor="monthly">Monthly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ONE_OFF" id="one-off" />
                            <Label htmlFor="one-off">One-Off</Label>
                        </div>
                        </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                name="specificDate"
                control={form.control}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Specific Date</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
              name="specificTime"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="destructive" type="submit" disabled={isLoading}>
                Add Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
