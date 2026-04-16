import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLORS, ORDER_STATUSES } from '../../constants';

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'received', label: 'New' },
  { key: 'washing', label: 'Washing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Done' },
];

export default function AdminDashboardScreen({ navigation }) {
  const { logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const counts = {
    total: orders.length,
    new: orders.filter((o) => o.status === 'received').length,
    processing: orders.filter((o) => !['received', 'completed'].includes(o.status)).length,
    completed: orders.filter((o) => o.status === 'completed').length,
  };

  const renderOrder = ({ item }) => {
    const statusInfo = ORDER_STATUSES.find((s) => s.key === item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AdminOrderDetail', { orderId: item.id })}
      >
        <View style={styles.cardRow}>
          <Text style={styles.cardIcon}>{statusInfo?.icon || '🧺'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardId}>#{item.id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.cardEmail}>{item.userEmail}</Text>
            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleDateString('en-NG', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.cardPrice}>₦{item.totalPrice?.toLocaleString()}</Text>
            <Text style={styles.statusText}>{statusInfo?.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Total" value={counts.total} color={COLORS.primary} />
        <StatCard label="New" value={counts.new} color={COLORS.warning} />
        <StatCard label="Processing" value={counts.processing} color={COLORS.secondary} />
        <StatCard label="Done" value={counts.completed} color={COLORS.success} />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No orders in this category</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function StatCard({ label, value, color }) {
  return (
    <View style={[statStyles.card, { borderTopColor: color }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 10,
    padding: 10, alignItems: 'center', borderTopWidth: 3,
  },
  value: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  header: {
    backgroundColor: COLORS.dark, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  logoutText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, padding: 12 },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8, gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  filterTextActive: { color: COLORS.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.muted, fontSize: 14 },
  list: { padding: 12, gap: 8 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 26 },
  cardId: { fontSize: 14, fontWeight: '700', color: COLORS.dark },
  cardEmail: { fontSize: 12, color: COLORS.muted },
  cardDate: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  cardPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  statusText: { fontSize: 11, color: COLORS.muted, marginTop: 3 },
});
