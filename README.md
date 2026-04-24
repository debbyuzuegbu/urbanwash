# urban. wash café 

A React Native laundry service management app built with Expo and Firebase. Customers can book laundry orders and track them in real time, while admins manage and update order statuses through a dedicated dashboard.

## Features

### Customer
- Register and log in with email and password
- Book a laundry order — select items, service type, address, and pickup date
- Flat basket price of ₦4,950 per order
- Track order status in real time with a live progress stepper
- View full order history

### Admin
- View all orders with live updates
- Filter orders by status (New, Washing, Ready, Done)
- View order details including customer info and items
- Update order status through 8 stages:
  `Received → Sorting → Washing → Drying → Ironing → Ready → Out for Delivery → Completed`

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Mobile app framework |
| Expo | Build and run without Xcode/Android Studio |
| Firebase Auth | User login and registration |
| Cloud Firestore | Real-time database for orders and users |
| React Navigation | Screen navigation |
| AsyncStorage | Persist login session |

## Project Structure

```
src/
├── config/
│   └── firebase.js          # Firebase initialisation
├── constants/
│   └── index.js             # Shared colors, items, statuses
├── context/
│   └── AuthContext.js       # Global auth state and role management
├── navigation/
│   └── AppNavigator.js      # Routes users based on role
└── screens/
    ├── auth/
    │   ├── LoginScreen.js
    │   └── RegisterScreen.js
    ├── customer/
    │   ├── HomeScreen.js
    │   ├── CreateOrderScreen.js
    │   ├── TrackOrderScreen.js
    │   └── OrderHistoryScreen.js
    └── admin/
        ├── AdminDashboardScreen.js
        └── AdminOrderDetailScreen.js
```

## Getting Started

### Prerequisites
- Node.js installed
- Expo Go app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- A Firebase project (free Spark plan)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/LaundryApp.git
cd LaundryApp
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables — copy `.env.example` to `.env` and fill in your Firebase config
```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

4. Start the app
```bash
npx expo start
```

5. Scan the QR code with Expo Go on your phone

## Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication → Email/Password**
4. Create a **Firestore Database** in test mode
5. Copy your config keys into `.env`

### Creating an Admin Account

1. Go to **Authentication → Users → Add user**
2. Add an email and password for the admin
3. Copy the generated **UID**
4. Go to **Firestore → Create collection** named `users`
5. Create a document with the UID as the Document ID and these fields:

```
name   → Admin
email  → your admin email
role   → admin
```
## Firestore Data Structure

### `users` collection
```json
{
  "uid": "...",
  "name": "Deb",
  "email": "customer@example.com",
  "phone": "08012345678",
  "role": "customer"
}
```

### `orders` collection
```json
{
  "userId": "...",
  "userEmail": "customer@example.com",
  "items": [
    { "id": "shirt", "qty": 2 },
    { "id": "jeans", "qty": 1 }
  ],
  "serviceType": "wash",
  "address": "12, rwanda street",
  "pickupDate": "2026-04-20",
  "totalPrice": 4950,
  "status": "washing",
  "createdAt": "2026-04-16T06:00:00.000Z",
  "updatedAt": "2026-04-16T08:00:00.000Z"
}
```

## Environment Variables

All Firebase keys are stored in `.env` and never committed to GitHub. See `.env.example` for the required variables.

## Roadmap

- [ ] Push notifications when order status changes
- [ ] Payment integration
- [ ] Delivery tracking
- [ ] Google Sign-In
- [ ] Firestore security rules for production
