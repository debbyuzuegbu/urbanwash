import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLORS, ORDER_STATUSES, LAUNDRY_ITEMS, SERVICE_TYPES } from '../../constants';

export default function AdminOrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
      setOrder(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsub;
  }, [orderId]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Updated', `Order status changed to: ${ORDER_STATUSES.find(s => s.key === newStatus)?.label}`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const confirmStatusChange = (status) => {
    const label = ORDER_STATUSES.find((s) => s.key === status)?.label;
    Alert.alert(
      'Update Status',
      `Move order to "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => updateStatus(status) },
      ]
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (!order) {
    return <View style={styles.center}><Text style={styles.notFound}>Order not found.</Text></View>;
  }

  const currentIndex = ORDER_STATUSES.findIndex((s) => s.key === order.status);
  const serviceName = SERVICE_TYPES.find((s) => s.id === order.serviceType)?.label || order.serviceType;
  const nextStatus = ORDER_STATUSES[currentIndex + 1];
  const prevStatus = ORDER_STATUSES[currentIndex - 1];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.currentStatus}>
          {ORDER_STATUSES[currentIndex]?.icon} {ORDER_STATUSES[currentIndex]?.label}
        </Text>
        <Text style={styles.headerSub}>{order.userEmail}</Text>
      </View>

      {/* Customer Info */}
      <Text style={styles.sectionTitle}>Customer Info</Text>
      <View style={styles.detailCard}>
        <Row label="Email" value={order.userEmail} />
        <Row label="Address" value={order.address} />
        <Row label="Pickup Date" value={order.pickupDate} />
        <Row label="Order Date" value={new Date(order.createdAt).toLocaleDateString('en-NG', {
          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        })} />
      </View>

      {/* Items */}
      <Text style={styles.sectionTitle}>Items Ordered</Text>
      <View style={styles.detailCard}>
        <Row label="Service" value={serviceName} />
        <View style={styles.divider} />
        {order.items?.map((item) => {
          const found = LAUNDRY_ITEMS.find((i) => i.id === item.id);
          return (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemIcon}>{found?.icon}</Text>
              <Text style={styles.itemName}>{found?.label || item.id}</Text>
              <Text style={styles.itemQty}>× {item.qty}</Text>
            </View>
          );
        })}
        <View style={styles.divider} />
        <Row label="Total Price" value={`₦${order.totalPrice?.toLocaleString()}`} highlight />
      </View>

      {/* Status Controls */}
      <Text style={styles.sectionTitle}>Update Status</Text>
      <View style={styles.statusGrid}>
        {ORDER_STATUSES.map((status, index) => {
          const isCurrent = index === currentIndex;
          const isDone = index < currentIndex;
          return (
            <TouchableOpacity
              key={status.key}
              style={[
                styles.statusBtn,
                isCurrent && styles.statusBtnCurrent,
                isDone && styles.statusBtnDone,
              ]}
              onPress={() => !isCurrent && confirmStatusChange(status.key)}
              disabled={isCurrent || updating}
            >
              <Text style={styles.statusBtnIcon}>{status.icon}</Text>
              <Text style={[styles.statusBtnText, isCurrent && styles.statusBtnTextCurrent]}>
                {status.label}
              </Text>
              {isCurrent && <Text style={styles.currentTag}>Current</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Next Step */}
      {nextStatus && (
        <TouchableOpacity
          style={[styles.nextBtn, updating && { opacity: 0.6 }]}
          onPress={() => confirmStatusChange(nextStatus.key)}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.nextBtnText}>
              Move to: {nextStatus.icon} {nextStatus.label} →
            </Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function Row({ label, value, highlight }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, highlight && rowStyles.highlight]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { fontSize: 14, color: COLORS.muted },
  value: { fontSize: 14, color: COLORS.dark, fontWeight: '600', flex: 1, textAlign: 'right' },
  highlight: { color: COLORS.primary, fontSize: 16, fontWeight: '800' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { color: COLORS.muted, fontSize: 16 },
  headerCard: {
    backgroundColor: COLORS.dark, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 20,
  },
  orderId: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 6 },
  currentStatus: { fontSize: 18, color: '#FCD34D', fontWeight: '700', marginBottom: 4 },
  headerSub: { fontSize: 13, color: '#9CA3AF' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 10 },
  detailCard: {
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 16, marginBottom: 20,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 8 },
  itemIcon: { fontSize: 18 },
  itemName: { flex: 1, fontSize: 14, color: COLORS.dark },
  itemQty: { fontSize: 14, fontWeight: '700', color: COLORS.muted },
  statusGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16,
  },
  statusBtn: {
    width: '47%', backgroundColor: COLORS.white, borderRadius: 10,
    padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  statusBtnCurrent: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  statusBtnDone: { backgroundColor: '#F0FDF4', borderColor: '#86EFAC' },
  statusBtnIcon: { fontSize: 20, marginBottom: 4 },
  statusBtnText: { fontSize: 12, color: COLORS.muted, fontWeight: '600', textAlign: 'center' },
  statusBtnTextCurrent: { color: COLORS.primary },
  currentTag: {
    fontSize: 10, color: COLORS.primary, fontWeight: '700',
    backgroundColor: '#DBEAFE', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, marginTop: 4,
  },
  nextBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  nextBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
