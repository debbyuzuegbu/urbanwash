import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { COLORS, LAUNDRY_ITEMS, SERVICE_TYPES } from '../../constants';

// Flat basket price — ₦4,950 per basket regardless of items
const BASKET_PRICE = 4950;

export default function CreateOrderScreen({ navigation }) {
  const { user } = useAuth();
  const [quantities, setQuantities] = useState({});
  const [serviceType, setServiceType] = useState('wash');
  const [address, setAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const updateQty = (itemId, delta) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const hasItems = Object.values(quantities).some((qty) => qty > 0);
  const totalPrice = hasItems ? BASKET_PRICE : 0;

  const selectedItems = Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ id, qty }));

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one item');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your pickup address');
      return;
    }
    if (!pickupDate.trim()) {
      Alert.alert('Error', 'Please enter your preferred pickup date');
      return;
    }
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        items: selectedItems,
        serviceType,
        address: address.trim(),
        pickupDate: pickupDate.trim(),
        totalPrice,
        status: 'received',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Order Placed!', 'Your order has been received. We will contact you shortly.', [
        { text: 'Track Order', onPress: () => navigation.replace('TrackOrder', { orderId: docRef.id }) },
        { text: 'Go Home', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Book Laundry</Text>

        {/* Service Type */}
        <Text style={styles.label}>Service Type</Text>
        <View style={styles.serviceRow}>
          {SERVICE_TYPES.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.serviceChip, serviceType === s.id && styles.serviceChipActive]}
              onPress={() => setServiceType(s.id)}
            >
              <Text style={[styles.serviceChipText, serviceType === s.id && styles.serviceChipTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Items */}
        <Text style={styles.label}>Select Items</Text>
        {LAUNDRY_ITEMS.map((item) => {
          const qty = quantities[item.id] || 0;
          return (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.label}</Text>
              </View>
              <View style={styles.qtyControl}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{qty}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Address */}
        <Text style={styles.label}>Pickup Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full address"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={2}
          placeholderTextColor={COLORS.muted}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => scrollRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Pickup Date */}
        <Text style={styles.label}>Preferred Pickup Date</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2026-04-18"
          value={pickupDate}
          onChangeText={setPickupDate}
          placeholderTextColor={COLORS.muted}
          returnKeyType="done"
          onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)}
        />

        {/* Total */}
        {hasItems && (
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Basket Price</Text>
              <Text style={styles.totalSub}>Flat rate per basket</Text>
            </View>
            <Text style={styles.totalPrice}>₦{BASKET_PRICE.toLocaleString()}</Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.btnText}>Place Order</Text>
          )}
        </TouchableOpacity>

        {/* Extra space so keyboard never covers the button */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.light },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '800', color: COLORS.dark, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.dark, marginBottom: 8, marginTop: 16 },
  serviceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  serviceChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  serviceChipText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  serviceChipTextActive: { color: COLORS.white },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 12, padding: 14, marginBottom: 8, gap: 12,
  },
  itemIcon: { fontSize: 26 },
  itemName: { fontSize: 15, fontWeight: '600', color: COLORS.dark },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '700', lineHeight: 22 },
  qtyNum: { fontSize: 16, fontWeight: '700', color: COLORS.dark, minWidth: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    padding: 14, fontSize: 15, color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginTop: 16,
  },
  totalLabel: { fontSize: 15, fontWeight: '600', color: COLORS.dark },
  totalSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  totalPrice: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 20,
  },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
