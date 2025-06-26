import { Hono } from 'hono';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@prisma/client/extension'; 
import { decode, sign, verify } from 'hono/jwt'
import { userRouter } from './Routes/user';
import { blogRouter } from './Routes/blog';

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>()

app.route("/api/v1/user",userRouter)
app.route("/api/v1/blog",blogRouter)


export default app;
