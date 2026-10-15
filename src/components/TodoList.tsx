import { useTheme } from "@/context/ThemeContext";
import type { Todo } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  /** `undefined` — Convex ще завантажує дані */
  todos: Todo[] | undefined;
}

export function TodoList({ todos }: TodoListProps) {
  const { colors } = useTheme();

  if (todos === undefined) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Синхронізація з Convex...
        </Text>
      </View>
    );
  }

  if (todos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="clipboard-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Список завдань порожній. Додайте нове завдання!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <TodoItem todo={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 8,
  },
  emptyContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
});
