import { PrismaClient } from '@prisma/client'
import { PubSub } from 'graphql-subscriptions'
import { Request, Response } from "express";

export interface Context {
  prisma: PrismaClient
  pubsub: PubSub
  req: Request
  res: Response
}

const prisma = new PrismaClient()
const pubsub = new PubSub()

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<Context> {
  return {
    prisma,
    pubsub,
    req,
    res,
  };
}
