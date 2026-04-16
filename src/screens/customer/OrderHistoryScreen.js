import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLORS, ORDER_STATUSES } from '../../constants';

export default function OrderHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🧺</Text>
        <Text style={styles.emptyText}>No orders yet</Text>
        <Text style={styles.emptySubText}>Your order history will appear here</Text>
      </View>
    );
  }

  const renderOrder = ({ item }) => {
    const statusInfo = ORDER_STATUSES.find((s) => s.key === item.status);
    const isCompleted = item.status === 'completed';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TrackOrder', { orderId: item.id })}
      >
        <View style={styles.cardRow}>
          <Text style={styles.cardIcon}>{statusInfo?.icon || '🧺'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardOrderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleDateString('en-NG', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.cardPrice}>₦{item.totalPrice?.toLocaleString()}</Text>
            <View style={[styles.badge, isCompleted ? styles.badgeDone : styles.badgeActive]}>
              <Text style={styles.badgeText}>{statusInfo?.label}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  emptySubText: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 16, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 6, elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 26 },
  cardOrderId: { fontSize: 15, fontWeight: '700', color: COLORS.dark },
  cardDate: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  cardPrice: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeDone: { backgroundColor: '#DCFCE7' },
  badgeActive: { backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: 11, fontWeight: '600', color: COLORS.dark },
});
