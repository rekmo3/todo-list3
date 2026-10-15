import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

const EMPTY_TEXT_ERROR = "Текст завдання не може бути порожнім";
const UNAUTHORIZED_ERROR = "Необхідно увійти в акаунт";
const FORBIDDEN_ERROR = "Завдання не знайдено або доступ заборонено";
const MAX_TEXT_LENGTH = 120;

function normalizeText(raw: string): string {
  const text = raw.trim();
  if (text.length === 0) throw new ConvexError(EMPTY_TEXT_ERROR);
  if (text.length > MAX_TEXT_LENGTH) {
    throw new ConvexError(
      `Текст завдання не може бути довшим за ${MAX_TEXT_LENGTH} символів`,
    );
  }
  return text;
}

/** Повертає id поточного користувача або кидає помилку (для мутацій). */
async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new ConvexError(UNAUTHORIZED_ERROR);
  return userId;
}

/** Повертає завдання лише якщо воно належить користувачу. */
async function getOwnedTodo(
  ctx: MutationCtx,
  id: Id<"todos">,
  userId: Id<"users">,
): Promise<Doc<"todos">> {
  const todo = await ctx.db.get(id);
  if (!todo || todo.userId !== userId) throw new ConvexError(FORBIDDEN_ERROR);
  return todo;
}

export const getTodos = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    return await ctx.db
      .query("todos")
      .withIndex("by_user_creation", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return { total: 0, completed: 0, active: 0, percentage: 0 };
    }

    const todos = await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const total = todos.length;
    const completed = todos.filter((t) => t.isCompleted).length;
    const active = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, completed, active, percentage };
  },
});

export const createTodo = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return await ctx.db.insert("todos", {
      userId,
      text: normalizeText(args.text),
      isCompleted: false,
      createdAt: Date.now(),
    });
  },
});

export const toggleTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const todo = await getOwnedTodo(ctx, args.id, userId);
    await ctx.db.patch(args.id, { isCompleted: !todo.isCompleted });
  },
});

export const updateTodo = mutation({
  args: { id: v.id("todos"), text: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await getOwnedTodo(ctx, args.id, userId);
    await ctx.db.patch(args.id, { text: normalizeText(args.text) });
  },
});

export const deleteTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await getOwnedTodo(ctx, args.id, userId);
    await ctx.db.delete(args.id);
  },
});

export const clearCompleted = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const completedTodos = await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isCompleted"), true))
      .collect();

    for (const todo of completedTodos) {
      await ctx.db.delete(todo._id);
    }

    return { deletedCount: completedTodos.length };
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const userTodos = await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const todo of userTodos) {
      await ctx.db.delete(todo._id);
    }

    return { deletedCount: userTodos.length };
  },
});
