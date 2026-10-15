import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  totalCount: number;
  completedCount: number;
  /** Ім'я авторизованого користувача для привітання */
  userName?: string | null;
}

export function Header({ totalCount, completedCount, userName }: HeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        <Ionicons name="list-circle-outline" size={32} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          Мій Список Завдань
        </Text>
      </View>
      {userName ? (
        <Text style={[styles.greeting, { color: colors.primary }]}>
          Привіт, {userName}!
        </Text>
      ) : null}
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {totalCount > 0
          ? `Виконано ${completedCount} з ${totalCount} завдань`
          : "Додайте своє перше завдання"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  greeting: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
  },
});
