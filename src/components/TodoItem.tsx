import Ionicons from "@expo/vector-icons/Ionicons";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import type { Todo } from "@/types";

interface TodoItemProps {
  todo: Todo;
}

const errorMessage = (err: unknown) =>
  err instanceof ConvexError && typeof err.data === "string"
    ? err.data
    : "Не вдалося виконати дію. Спробуйте ще раз.";

export function TodoItem({ todo }: TodoItemProps) {
  const { colors } = useTheme();
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const updateTodo = useMutation(api.todos.updateTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch (err) {
      Alert.alert("Помилка", errorMessage(err));
    }
  };

  const startEditing = () => {
    setEditText(todo.text);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      run(() => updateTodo({ id: todo._id, text: trimmed }));
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  return (
    <View
      style={[
        styles.item,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        onPress={() => run(() => toggleTodo({ id: todo._id }))}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.isCompleted }}
      >
        <Ionicons
          name={todo.isCompleted ? "checkmark-circle" : "ellipse-outline"}
          size={26}
          color={todo.isCompleted ? colors.success : colors.textMuted}
        />
      </TouchableOpacity>

      {isEditing ? (
        <TextInput
          style={[
            styles.editInput,
            {
              borderColor: colors.primary,
              backgroundColor: colors.surface,
              color: colors.text,
            },
          ]}
          value={editText}
          onChangeText={setEditText}
          onBlur={handleSave}
          onSubmitEditing={handleSave}
          autoFocus
          maxLength={120}
          returnKeyType="done"
        />
      ) : (
        <TouchableOpacity style={styles.textWrapper} onLongPress={startEditing}>
          <Text
            style={[
              styles.text,
              { color: colors.text },
              todo.isCompleted && {
                color: colors.textMuted,
                textDecorationLine: "line-through",
              },
            ]}
          >
            {todo.text}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.actions}>
        {!isEditing && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={startEditing}
            accessibilityLabel="Редагувати завдання"
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => run(() => deleteTodo({ id: todo._id }))}
          accessibilityLabel="Видалити завдання"
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  textWrapper: {
    flex: 1,
  },
  text: {
    fontSize: 16,
  },
  editInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 16,
    borderWidth: 1.5,
    borderRadius: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 6,
  },
});
