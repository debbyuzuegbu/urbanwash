import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { COLORS, ORDER_STATUSES, LAUNDRY_ITEMS, SERVICE_TYPES } from '../../constants';

export default function TrackOrderScreen({ route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
      setOrder(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsub;
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Order not found.</Text>
      </View>
    );
  }

  const currentIndex = ORDER_STATUSES.findIndex((s) => s.key === order.status);
  const serviceName = SERVICE_TYPES.find((s) => s.id === order.serviceType)?.label || order.serviceType;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Order Header */}
      <View style={styles.headerCard}>
        <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>
            {ORDER_STATUSES[currentIndex]?.icon} {ORDER_STATUSES[currentIndex]?.label}
          </Text>
        </View>
        <Text style={styles.placedAt}>
          Placed: {new Date(order.createdAt).toLocaleDateString('en-NG', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
          })}
        </Text>
      </View>

      {/* Progress Stepper */}
      <Text style={styles.sectionTitle}>Order Progress</Text>
      <View style={styles.stepperCard}>
        {ORDER_STATUSES.map((status, index) => {
          const isDone = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === ORDER_STATUSES.length - 1;

          return (
            <View key={status.key} style={styles.stepRow}>
              {/* Line above (except first) */}
              {index > 0 && (
                <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
              )}
              <View style={styles.stepLeft}>
                <View style={[styles.stepDot, isDone && styles.stepDotDone, isCurrent && styles.stepDotCurrent]}>
                  <Text style={styles.stepDotText}>{isDone ? '✓' : (index + 1)}</Text>
                </View>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepLabel, isDone && styles.stepLabelDone, isCurrent && styles.stepLabelCurrent]}>
                  {status.icon} {status.label}
                </Text>
                {isCurrent && (
                  <Text style={styles.stepCurrent}>← Current stage</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Order Details */}
      <Text style={styles.sectionTitle}>Order Details</Text>
      <View style={styles.detailCard}>
        <Row label="Service" value={serviceName} />
        <Row label="Pickup Date" value={order.pickupDate} />
        <Row label="Address" value={order.address} />

        <View style={styles.divider} />
        <Text style={styles.detailLabel}>Items:</Text>
        {order.items?.map((item) => {
          const found = LAUNDRY_ITEMS.find((i) => i.id === item.id);
          return (
            <Text key={item.id} style={styles.itemLine}>
              {found?.icon} {found?.label || item.id} × {item.qty}
            </Text>
          );
        })}

        <View style={styles.divider} />
        <Row label="Total Price" value={`₦${order.totalPrice?.toLocaleString()}`} highlight />
      </View>
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
    backgroundColor: COLORS.primary, borderRadius: 16,
    padding: 20, marginBottom: 20, alignItems: 'center',
  },
  orderId: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 8 },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6, marginBottom: 8,
  },
  statusBadgeText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  placedAt: { fontSize: 12, color: '#BFDBFE' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 12 },
  stepperCard: {
    backgroundColor: COLORS.white, borderRadius: 14,
    padding: 16, marginBottom: 20,
  },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  stepLine: {
    position: 'absolute', left: 15, top: -8, width: 2,
    height: 20, backgroundColor: COLORS.border,
  },
  stepLineDone: { backgroundColor: COLORS.success },
  stepLeft: { width: 32, alignItems: 'center', marginRight: 12, paddingTop: 2 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: COLORS.success },
  stepDotCurrent: { backgroundColor: COLORS.primary },
  stepDotText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  stepContent: { flex: 1, paddingVertical: 4 },
  stepLabel: { fontSize: 14, color: COLORS.muted },
  stepLabelDone: { color: COLORS.success, fontWeight: '600' },
  stepLabelCurrent: { color: COLORS.primary, fontWeight: '700' },
  stepCurrent: { fontSize: 11, color: COLORS.primary, marginTop: 2 },
  detailCard: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 16,
  },
  detailLabel: { fontSize: 14, fontWeight: '700', color: COLORS.dark, marginBottom: 6 },
  itemLine: { fontSize: 14, color: COLORS.dark, paddingVertical: 2, paddingLeft: 4 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
});
