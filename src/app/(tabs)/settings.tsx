import { useTheme } from "@/context/ThemeContext";
import { confirmAction } from "@/utils/confirm";
import { api } from "@convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import Constants from "expo-constants";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();

  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);
  const stats = useQuery(api.todos.getStats);
  const clearCompletedMutation = useMutation(api.todos.clearCompleted);
  const clearAllMutation = useMutation(api.todos.clearAll);

  const totalCount = stats?.total ?? 0;
  const completedCount = stats?.completed ?? 0;
  const version = Constants.expoConfig?.version ?? "5.0.0";
  const appName = Constants.expoConfig?.name ?? "rn-todo-list";
  const appEnv = String(Constants.expoConfig?.extra?.appEnv ?? "development");

  const runClear = async (
    mutation: () => Promise<{ deletedCount: number }>,
    successTitle: string,
  ) => {
    try {
      const { deletedCount } = await mutation();
      Alert.alert(successTitle, `Видалено завдань: ${deletedCount}`);
    } catch {
      Alert.alert("Помилка", "Не вдалося виконати очищення. Спробуйте ще раз.");
    }
  };

  const handleClearCompleted = () => {
    if (completedCount === 0) {
      confirmAction({
        title: "Немає виконаних завдань",
        message: "Спершу відмітьте хоча б одне завдання як виконане.",
        confirmText: "OK",
        cancelText: "Закрити",
        onConfirm: () => {},
      });
      return;
    }
    confirmAction({
      title: "Очистити виконані?",
      message: `Буде видалено завдань: ${completedCount}. Цю дію не можна скасувати.`,
      confirmText: "Очистити",
      destructive: true,
      onConfirm: () => runClear(clearCompletedMutation, "Виконані очищено"),
    });
  };

  const handleClearAll = () => {
    if (totalCount === 0) return;
    confirmAction({
      title: "Видалити всі завдання?",
      message: `Буде видалено завдань: ${totalCount}. Цю дію не можна скасувати.`,
      confirmText: "Видалити все",
      destructive: true,
      onConfirm: () => runClear(clearAllMutation, "Список очищено"),
    });
  };

  const handleSignOut = () => {
    confirmAction({
      title: "Вийти з акаунта?",
      message: "Щоб повернутися до своїх завдань, потрібно буде увійти знову.",
      confirmText: "Вийти",
      destructive: true,
      onConfirm: () => {
        // Stack.Protected автоматично поверне на екран входу
        signOut().catch(() =>
          Alert.alert("Помилка", "Не вдалося вийти. Спробуйте ще раз."),
        );
      },
    });
  };

  const card = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.bg }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Налаштування</Text>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          ПРОФІЛЬ
        </Text>
        <View style={card}>
          <View style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={24} color="#ffffff" />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {user?.name ?? "Користувач"}
              </Text>
              <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                {user === undefined ? "Завантаження..." : (user?.email ?? "")}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.row}
            onPress={handleSignOut}
            activeOpacity={0.7}
            accessibilityLabel="Вийти з акаунта"
          >
            <View style={[styles.iconBadge, { backgroundColor: `${colors.danger}22` }]}>
              <Ionicons name="log-out-outline" size={22} color={colors.danger} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.danger }]}>
                Вийти з акаунта
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          ОФОРМЛЕННЯ
        </Text>
        <View style={card}>
          <View style={styles.row}>
            <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}22` }]}>
              <Ionicons
                name={isDarkMode ? "moon" : "sunny"}
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {isDarkMode ? "Темна тема" : "Світла тема"}
              </Text>
              <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                Перемкнути оформлення додатку
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
              accessibilityLabel="Темна тема"
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          ЗАВДАННЯ
        </Text>
        <View style={card}>
          <TouchableOpacity
            style={styles.row}
            onPress={handleClearCompleted}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBadge, { backgroundColor: `${colors.success}22` }]}>
              <Ionicons name="checkmark-done" size={22} color={colors.success} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Очистити виконані завдання
              </Text>
              <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                Виконаних: {completedCount}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={[styles.row, totalCount === 0 && styles.disabled]}
            onPress={handleClearAll}
            disabled={totalCount === 0}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBadge, { backgroundColor: `${colors.danger}22` }]}>
              <Ionicons name="trash" size={22} color={colors.danger} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.danger }]}>
                Видалити всі завдання
              </Text>
              <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                Всього: {totalCount}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          ПРО ДОДАТОК
        </Text>
        <View style={card}>
          <View style={styles.row}>
            <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}22` }]}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {appName}
              </Text>
              <Text style={[styles.rowDesc, { color: colors.textMuted }]}>
                Todo App 5.0 · {appEnv}
              </Text>
            </View>
            <Text style={[styles.version, { color: colors.textMuted }]}>
              v{version}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: "700", marginTop: 8, marginBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "600" },
  rowDesc: { fontSize: 13, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 66 },
  disabled: { opacity: 0.5 },
  version: { fontSize: 14, fontWeight: "600" },
});
