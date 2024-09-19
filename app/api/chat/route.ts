// app/api/chat/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from '@langchain/langgraph';
import prismadb from '@/lib/prismadb';
import { MemoryManager } from '@/lib/memory';
import { rateLimit } from '@/lib/rate-limit';
import { AIMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { addTaskTool } from '@/tools/newTaskTool'; // Adjust the path as necessary

dotenv.config({ path: `.env` });

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { prompt } = await request.json();

    const identifier = request.url + '-' + userId;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    const coach = await prismadb.coach.update({
      where: {
        userId: userId,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: 'user',
            userId: userId,
          },
        },
      },
    });

    if (!coach) {
      return new NextResponse('Coach not found', { status: 404 });
    }

    const name = coach.id;
    const coachKey = {
      coachName: name,
      userId: userId,
      modelName: 'openai-chat',
    };

    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(coachKey);
    if (records.length === 0) {
      await memoryManager.seedChatHistory(coach.seed, '\n\n', coachKey);
    }

    // Write user's message to history
    await memoryManager.writeToHistory('User: ' + prompt, coachKey);

    const recentChatHistory = await memoryManager.readLatestHistory(coachKey);

    // Get the last 10 messages
    const lastTenMessages = recentChatHistory.slice(-10);

    // Create message history
    const messageHistory: BaseMessage[] = [];

    for (const message of lastTenMessages) {
      if (message.startsWith('User:')) {
        messageHistory.push(new HumanMessage(message.replace('User: ', '').trim()));
      } else if (message.startsWith('System:')) {
        messageHistory.push(new AIMessage(message.replace('System: ', '').trim()));
      }
    }

    // Add the new user message
    messageHistory.push(new HumanMessage(prompt));

    // Initialize the model
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Define your tools
    const magicTool = tool(
      async ({ input }: { input: number }) => {
        return `${input + 2}`;
      },
      {
        name: 'magic_function',
        description: 'Applies a magic function to an input.',
        schema: z.object({
          input: z.number(),
        }),
      }
    );

    // Include the new addTaskTool
    const tools = [magicTool, addTaskTool];

    // Initialize memory saver for persistence
    const checkpointer = new MemorySaver();

    // Create the react agent with memory
    const appWithMemory = createReactAgent({
      llm,
      tools,
      checkpointSaver: checkpointer,
    });

    // Use userId as thread_id for memory
    const thread_id = `${userId}-${coach.id}`;

    // Invoke the agent
    const agentOutput = await appWithMemory.invoke(
      {
        messages: messageHistory,
      },
      {
        configurable: {
          thread_id: thread_id,
        },
      }
    );

    // Get the assistant's response
    const assistantMessage = agentOutput.messages[agentOutput.messages.length - 1].content;

    // Write assistant's message to history
    await memoryManager.writeToHistory('System: ' + assistantMessage, coachKey);

    // Save assistant's message to the database
    if (assistantMessage && assistantMessage.length > 1) {
      await prismadb.coach.update({
        where: {
          userId: userId,
        },
        data: {
          messages: {
            create: {
              content: assistantMessage,
              role: 'system',
              userId: userId,
            },
          },
        },
      });
    }

    // Return the assistant's response
    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
