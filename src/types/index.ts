import type { Doc } from "@convex/_generated/dataModel";

/** Завдання з Convex: { _id, _creationTime, text, isCompleted, createdAt } */
export type Todo = Doc<"todos">;

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  /** Головне тло екрана */
  bg: string;
  /** Тло карток, форми та елементів списку */
  surface: string;
  /** Основний колір тексту */
  text: string;
  /** Підписи та неактивні елементи */
  textMuted: string;
  /** Межі та розділювачі */
  border: string;
  /** Акцентний колір (кнопки, активна вкладка) */
  primary: string;
  /** Виконані завдання */
  success: string;
  /** Кнопки видалення / небезпечні дії */
  danger: string;
  /** Стиль системного статус-бару */
  statusBarStyle: "light" | "dark";
}
