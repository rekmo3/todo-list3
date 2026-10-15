import type { Todo as TodoDoc } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const TODOS_STORAGE_KEY = "@todo_items";

/** Локальна (офлайн) версія завдання — без прив'язки до користувача Convex */
type Todo = Omit<TodoDoc, "userId">;

interface TodoContextType {
  todos: Todo[];
  loaded: boolean;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  deleteTodo: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
}

const TodoContext = createContext<TodoContextType | null>(null);

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const isTodo = (value: unknown): value is Todo => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v._id === "string" &&
    typeof v.text === "string" &&
    typeof v.isCompleted === "boolean" &&
    typeof v.createdAt === "number"
  );
};

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(TODOS_STORAGE_KEY);
        if (!cancelled && raw) {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) setTodos(parsed.filter(isTodo));
        }
      } catch (err) {
        console.error("Не вдалося зчитати завдання:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos)).catch(
      (err) => console.error("Не вдалося зберегти завдання:", err),
    );
  }, [todos, loaded]);

  const addTodo = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      ...prev,
      {
        _id: createId() as Todo["_id"],
        _creationTime: Date.now(),
        text: trimmed,
        isCompleted: false,
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, isCompleted: !t.isCompleted } : t,
      ),
    );
  }, []);

  const editTodo = useCallback((id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) =>
      prev.map((t) => (t._id === id ? { ...t, text: trimmed } : t)),
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((t) => !t.isCompleted));
  }, []);

  const clearAll = useCallback(() => setTodos([]), []);

  const value = useMemo<TodoContextType>(
    () => ({
      todos,
      loaded,
      addTodo,
      toggleTodo,
      editTodo,
      deleteTodo,
      clearCompleted,
      clearAll,
    }),
    [todos, loaded, addTodo, toggleTodo, editTodo, deleteTodo, clearCompleted, clearAll],
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos(): TodoContextType {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error("useTodos має використовуватись всередині <TodoProvider>");
  }
  return ctx;
}
