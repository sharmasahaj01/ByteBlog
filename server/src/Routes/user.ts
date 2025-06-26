import { Hono } from 'hono';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@prisma/client/edge';
import { decode, sign, verify } from 'hono/jwt'
import { signupInput, signinInput } from '@sahajsharma01/bb-common';

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>()

userRouter.post('/signup', async (c) => {
  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);
  if(!success){
    c.status(411)
    return c.json({
        msg:"Inputs are not correct"
    })
  }  
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try{
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name
      }
    })
    const jwt= await sign({
      id: user.id
    },c.env.JWT_SECRET)
    return c.text(jwt)
  }catch(e){
    return c.status(403);
  }
	
})


userRouter.post('/signin', async (c) => {
    const body = await c.req.json();
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL	,
	}).$extends(withAccelerate());
    const { success } = signinInput.safeParse(body);
    if(!success){
        c.status(411);
        return c.json({
            message: "Inputs are not correct"
        })
    }
  try{
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password
      }
    });
  
    if (!user) {
      c.status(403);
      return c.json({
        message: "Incorrect Credentials"
      })
    }
  
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.text(jwt);

    }catch(e){
    console.log(e);
    c.status(411);
    return c.text("Invalid");
  }
})