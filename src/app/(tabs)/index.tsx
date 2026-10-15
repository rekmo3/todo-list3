import { Header } from "@/components/Header";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TasksScreen() {
  const { colors } = useTheme();

  // Реактивний список: оновлюється автоматично при будь-якій зміні в Convex
  const todos = useQuery(api.todos.getTodos);
  const createTodo = useMutation(api.todos.createTodo);
  const user = useQuery(api.users.currentUser);

  const totalCount = todos?.length ?? 0;
  const completedCount = todos?.filter((t) => t.isCompleted).length ?? 0;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.bg }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Header
            totalCount={totalCount}
            completedCount={completedCount}
            userName={user?.name}
          />
          <TodoForm onAdd={(text) => createTodo({ text })} />
          <View style={styles.listWrapper}>
            <TodoList todos={todos} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  card: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  listWrapper: { flex: 1 },
});
