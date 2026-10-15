import { useTheme } from "@/context/ThemeContext";
import { api } from "@convex/_generated/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "convex/react";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={icon} size={24} color={accent} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

export default function StatsScreen() {
  const { colors } = useTheme();
  const stats = useQuery(api.todos.getStats);

  if (stats === undefined) {
    return (
      <SafeAreaView
        style={[styles.safeArea, styles.center, { backgroundColor: colors.bg }]}
        edges={["top", "left", "right"]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const { total, completed, active, percentage: percent } = stats;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.bg }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Статистика</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Ваша продуктивність у цифрах
        </Text>

        <View style={styles.grid}>
          <StatCard
            label="Всього завдань"
            value={total}
            icon="albums-outline"
            accent={colors.primary}
          />
          <StatCard
            label="Активні"
            value={active}
            icon="hourglass-outline"
            accent="#f59e0b"
          />
          <StatCard
            label="Виконані"
            value={completed}
            icon="checkmark-done-outline"
            accent={colors.success}
          />
          <StatCard
            label="Відсоток виконання"
            value={`${percent}%`}
            icon="trending-up-outline"
            accent="#0ea5e9"
          />
        </View>

        <View
          style={[
            styles.progressCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>
              Загальний прогрес
            </Text>
            <Text style={[styles.progressPercent, { color: colors.success }]}>
              {percent}%
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.fill,
                { width: `${percent}%`, backgroundColor: colors.success },
              ]}
            />
          </View>
          <Text style={[styles.progressHint, { color: colors.textMuted }]}>
            {total === 0
              ? "Додайте завдання, щоб побачити прогрес"
              : `${completed} з ${total} завдань виконано`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: "700", marginTop: 8 },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: { fontSize: 30, fontWeight: "800" },
  statLabel: { fontSize: 13, fontWeight: "500" },
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: { fontSize: 16, fontWeight: "600" },
  progressPercent: { fontSize: 16, fontWeight: "700" },
  track: { height: 10, borderRadius: 5, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 5 },
  progressHint: { fontSize: 13 },
});
