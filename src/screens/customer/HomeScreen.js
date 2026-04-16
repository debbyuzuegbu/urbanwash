import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLORS, ORDER_STATUSES } from '../../constants';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [latestOrder, setLatestOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const unsub = onSnapshot(q, (snap) => {
      setLatestOrder(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
      setLoadingOrder(false);
    });
    return unsub;
  }, [user.uid]);

  const statusInfo = latestOrder
    ? ORDER_STATUSES.find((s) => s.key === latestOrder.status)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello 👋</Text>
          <Text style={styles.name}>{user.displayName || user.email}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerLogoSub}>wash café</Text>
        <Text style={styles.bannerLogoMain}>urban.</Text>
        <Text style={styles.bannerSub}>Professional laundry at your doorstep</Text>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.navigate('CreateOrder')}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabel}>Book Laundry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: COLORS.success }]}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>My Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Latest Order Status */}
      <Text style={styles.sectionTitle}>Latest Order</Text>
      {loadingOrder ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : latestOrder ? (
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() => navigation.navigate('TrackOrder', { orderId: latestOrder.id })}
        >
          <View style={styles.orderCardRow}>
            <Text style={styles.orderIcon}>{statusInfo?.icon || '🧺'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderStatus}>{statusInfo?.label || latestOrder.status}</Text>
              <Text style={styles.orderId}>Order #{latestOrder.id.slice(-6).toUpperCase()}</Text>
            </View>
            <Text style={styles.orderPrice}>₦{latestOrder.totalPrice?.toLocaleString()}</Text>
          </View>
          <Text style={styles.trackHint}>Tap to track →</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No orders yet. Book your first laundry!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  greeting: { fontSize: 14, color: COLORS.muted },
  name: { fontSize: 18, fontWeight: '700', color: COLORS.dark },
  logoutBtn: {
    backgroundColor: COLORS.border, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 8,
  },
  logoutText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  banner: {
    backgroundColor: COLORS.dark, borderRadius: 16,
    padding: 24, marginBottom: 24,
  },
  bannerLogoSub: {
    fontSize: 12, color: COLORS.accent, fontWeight: '400',
    letterSpacing: 2, textTransform: 'lowercase', marginBottom: 0,
  },
  bannerLogoMain: {
    fontSize: 38, fontWeight: '900', color: COLORS.white,
    letterSpacing: -1, marginBottom: 8,
  },
  bannerSub: { fontSize: 13, color: COLORS.muted },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.dark,
    marginBottom: 12,
  },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: {
    flex: 1, borderRadius: 14, padding: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionLabel: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  orderCard: {
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 16, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 2,
  },
  orderCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orderIcon: { fontSize: 28 },
  orderStatus: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  orderId: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  orderPrice: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  trackHint: { fontSize: 12, color: COLORS.primary, marginTop: 8, fontWeight: '600' },
  emptyCard: {
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 24, alignItems: 'center',
  },
  emptyText: { color: COLORS.muted, fontSize: 14, textAlign: 'center' },
});
