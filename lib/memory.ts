import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";


type CoachKey = {
  coachName: string;
  modelName: string;
  userId: string;
};


export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDBClient: Pinecone;

  private constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private generateRedisCoachKey(coachKey: CoachKey): string {
    return `${coachKey.coachName}-${coachKey.modelName}-${coachKey.userId}`;
  }

  public async writeToHistory(text: string, coachKey: CoachKey) {
    if (!coachKey || typeof coachKey.userId === "undefined") {
      console.log("Coach key set incorrectly");
      return "";
    }

    const key = this.generateRedisCoachKey(coachKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    // Upsert vector representation of the text to Pinecone
    await this.upsertVector(text, coachKey);

    return result;
  }

  public async readLatestHistory(coachKey: CoachKey): Promise<string[]> {
    if (!coachKey || typeof coachKey.userId === "undefined") {
      console.log("Coach key set incorrectly");
      return [];
    }
  
    const key = this.generateRedisCoachKey(coachKey);
    let result = (await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    })) as string[];
  
    result = result.slice(-30).reverse();
    return result;
  }
  

  public async seedChatHistory(
    seedContent: string,
    delimiter: string = "\n",
    coachKey: CoachKey
  ) {
    const key = this.generateRedisCoachKey(coachKey);
    if (await this.history.exists(key)) {
      console.log("User already has chat history");
      return;
    }

    const content = seedContent.split(delimiter);
    let counter = 0;
    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;

      // Upsert vector representation of the line to Pinecone
      await this.upsertVector(line, coachKey);
    }
  }

  private async upsertVector(text: string, coachKey: CoachKey) {
    if (!process.env.PINECONE_INDEX) {
      throw new Error("PINECONE_INDEX environment variable is not set.");
    }

    const pineconeIndex = await this.vectorDBClient.index(process.env.PINECONE_INDEX!);
    const namespace = pineconeIndex.namespace(coachKey.userId); // Use userId as namespace

    const embeddings = await new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }).embedQuery(text);

    const vector: PineconeRecord = {
      id: `${this.generateRedisCoachKey(coachKey)}-${Date.now()}`,
      values: embeddings,
      metadata: {
        text: text,
        coachName: coachKey.coachName,
        modelName: coachKey.modelName,
        userId: coachKey.userId,
      },
    };

    await namespace.upsert([vector]);
  }

  public async vectorSearch(
    query: string,
    coachKey: CoachKey,
    topK: number = 3
  ) {
    if (!process.env.PINECONE_INDEX) {
      throw new Error("PINECONE_INDEX environment variable is not set.");
    }

    const pineconeIndex = await this.vectorDBClient.index(process.env.PINECONE_INDEX!);
    const namespace = pineconeIndex.namespace(coachKey.userId); // Use userId as namespace

    const embeddings = await new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }).embedQuery(query);

    const queryRequest = {
      topK: topK,
      includeMetadata: true,
    };

    const queryResponse = await namespace.query({
      vector: embeddings,
      topK: topK,
      includeMetadata: true,
    });
    

    const similarDocs =
      queryResponse.matches?.map((match) => ({
        pageContent: match.metadata?.text || "",
        score: match.score || 0,
      })) || [];

    return similarDocs;
  }
}
