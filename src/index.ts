import { PrismaClient } from "@prisma/client";
const express = require("express");
const cors = require("cors");
const zod = require("zod");
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

interface User {
  username: string,
  password: string,
  firstName: string,
  lastName: string
}

const validateUser = (req: any, res: any, next: any) => {
  const body = req.body;
  const userSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
  });

  const { success } = userSchema.safeParse(body);

  if (!success) {
    res.status(411).json({
      "message": "Invalid user data",
    });
  }

  next();
}

async function createUser(user: User) {
  const res = await prisma.user.create({
    data: user,
    select: {
      id: true
    }
  });

  console.log(res);

  return res;
}

app.post("/signup", validateUser, async (req: any, res: any) => {
  const body = req.body;

  try {
    await createUser(body);
    res.status(200).json({
      "message": "User created successfully"
    })
  } catch(e) {
    res.status(411).json({
      "message": "Duplicate data creation",
    })
  }

});

const todoSchema = zod.object({
  userId: zod.number(),
  title: zod.string(),
  description: zod.string()
})

async function createTodo(userId: number, title: string, description: string) {
  const res = await prisma.todo.create({
    data: {
      userId: userId,
      title: title,
      description: description
    }
  });

  console.log(res);
}

// Creating todo
app.post("/createtodo", async (req: any, res: any) => {
  const body = req.body;
  const { success } = todoSchema.safeParse(body);

  if (!success) {
    res.status(411).json({
      "message": "Invalid todo data",
    });
  }

  try {
    await createTodo(body.userId, body.title, body.description);
    res.status(200).json({
      "message": "Todo created successfully",
    })
  } catch(e) {
    res.status(411).json({
      "message": "Invalid todo data",
    })
  }
});

async function getTodos(userId: number) {
  const res = await prisma.todo.findMany({
    where: { userId: userId },
    select: {
      id: true,
      title: true,
      description: true,
      done: true
    }
  })

  console.log(res);

  return res;
}

app.post("/todos", async (req: any, res: any) => {
  const body = req.body;
  try {
    const response = await getTodos(body.userId);
    res.status(200).json({
      "todos": response
    })
  } catch(e) {
    res.status(411).json({
      "message": "No user exists",
    })
  }
});

async function getTodosAndUserDetails(userId: number, ) {
  const res = await prisma.user.findFirst({
    where: {
      id: userId
    },
    include: {
      todos: {
        select: {
          title: true,
          description: true,
          id: true
        }
      },
    },
  });

  console.log(res);

  return res;
};

app.post("/gettodosofuser", async (req: any, res: any) => {
  const body = req.body;
  const userIdScehma = zod.number();
  const { success } = userIdScehma.safeParse(body.userId);

  if (!success) {
    res.status(411).json({
      "message": "Invalid input data",
    });
  }

  try {
    const response = await getTodosAndUserDetails(body.userId);
    res.status(200).json({
      "data": response
    })
  } catch(e) {
    res.status(411).json({
      "message": "No user exists",
    })
  }

});

app.listen(3000, () => {
  console.log("App is listening on PORT 3000");
})
