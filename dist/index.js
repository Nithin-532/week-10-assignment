"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express = require("express");
const cors = require("cors");
const zod = require("zod");
const prisma = new client_1.PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());
const validateUser = (req, res, next) => {
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
};
function createUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.create({
            data: user,
            select: {
                id: true
            }
        });
        console.log(res);
        return res;
    });
}
app.post("/signup", validateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        yield createUser(body);
        res.status(200).json({
            "message": "User created successfully"
        });
    }
    catch (e) {
        res.status(411).json({
            "message": "Duplicate data creation",
        });
    }
}));
const todoSchema = zod.object({
    userId: zod.number(),
    title: zod.string(),
    description: zod.string()
});
function createTodo(userId, title, description) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.todo.create({
            data: {
                userId: userId,
                title: title,
                description: description
            }
        });
        console.log(res);
    });
}
// Creating todo
app.post("/createtodo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { success } = todoSchema.safeParse(body);
    if (!success) {
        res.status(411).json({
            "message": "Invalid todo data",
        });
    }
    try {
        yield createTodo(body.userId, body.title, body.description);
        res.status(200).json({
            "message": "Todo created successfully",
        });
    }
    catch (e) {
        res.status(411).json({
            "message": "Invalid todo data",
        });
    }
}));
function getTodos(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.todo.findMany({
            where: { userId: userId },
            select: {
                id: true,
                title: true,
                description: true,
                done: true
            }
        });
        console.log(res);
        return res;
    });
}
app.post("/todos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const response = yield getTodos(body.userId);
        res.status(200).json({
            "todos": response
        });
    }
    catch (e) {
        res.status(411).json({
            "message": "No user exists",
        });
    }
}));
function getTodosAndUserDetails(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.findFirst({
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
    });
}
;
app.post("/gettodosofuser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const userIdScehma = zod.number();
    const { success } = userIdScehma.safeParse(body.userId);
    if (!success) {
        res.status(411).json({
            "message": "Invalid input data",
        });
    }
    try {
        const response = yield getTodosAndUserDetails(body.userId);
        res.status(200).json({
            "data": response
        });
    }
    catch (e) {
        res.status(411).json({
            "message": "No user exists",
        });
    }
}));
app.listen(3000, () => {
    console.log("App is listening on PORT 3000");
});
