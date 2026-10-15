import { useTheme } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ConvexError } from "convex/values";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TodoFormProps {
  onAdd: (text: string) => Promise<unknown>;
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const { colors } = useTheme();
  const [text, setText] = useState("");

  const canSubmit = text.trim().length > 0;

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    try {
      await onAdd(trimmed);
      setText("");
    } catch (err) {
      // текст лишається в полі, щоб його не довелося вводити знову
      Alert.alert(
        "Помилка",
        err instanceof ConvexError && typeof err.data === "string"
          ? err.data
          : "Не вдалося додати завдання. Спробуйте ще раз.",
      );
    }
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.bg,
            color: colors.text,
          },
        ]}
        placeholder="Що потрібно зробити?"
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        maxLength={120}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <TouchableOpacity
        style={[
          styles.addBtn,
          { backgroundColor: colors.primary },
          !canSubmit && styles.addBtnDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityLabel="Додати завдання"
      >
        <Ionicons name="add" size={20} color="#ffffff" />
        <Text style={styles.addBtnText}>Додати</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderRadius: 10,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: 10,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
});
