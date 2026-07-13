import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/firestore_service.dart';
import '../services/printer_service.dart'; // Import PrinterService
import '../models/product.dart';
import '../models/transaction.dart';
import '../models/payment.dart';

import 'auth_provider.dart'; // Import auth_provider

/// Provider for FirestoreService instance
final firestoreServiceProvider = Provider<FirestoreService>((ref) {
  return FirestoreService();
});

/// Provider for PrinterService instance
final printerServiceProvider = Provider<PrinterService>((ref) {
  return PrinterService();
});

/// Reactive provider for printer connection status.
/// Uses periodic polling to ensure detection even when hardware state changes
/// (like Bluetooth being turned off) don't fire events in the plugin.
final printerConnectionProvider = StreamProvider<bool>((ref) async* {
  final printer = ref.watch(printerServiceProvider);

  while (true) {
    bool connected = false;
    try {
      connected = await printer.isConnected();
    } catch (_) {
      connected = false;
    }
    yield connected;
    await Future.delayed(const Duration(seconds: 2));
  }
});

// =====================
// PAYMENTS PROVIDERS
// =====================

/// Stream provider for all payments
final paymentsProvider = StreamProvider<List<Payment>>((ref) {
  ref.watch(authStateProvider);
  return ref.watch(firestoreServiceProvider).getPayments();
});

// =====================
// PRODUCTS PROVIDERS
// =====================

/// Stream provider for all products
final productsProvider = StreamProvider<List<Product>>((ref) {
  ref.watch(authStateProvider);
  return ref.watch(firestoreServiceProvider).getProducts();
});

// =====================
// TRANSACTIONS PROVIDERS
// =====================

/// Stream provider for all transactions
final transactionsProvider = StreamProvider<List<TransactionModel>>((ref) {
  ref.watch(authStateProvider);
  return ref.watch(firestoreServiceProvider).getTransactions();
});

// =====================
// DASHBOARD PROVIDERS
// =====================

/// Provider for today's sales summary
final salesSummaryProvider = Provider<AsyncValue<Map<String, dynamic>>>((ref) {
  final transactionsAsync = ref.watch(transactionsProvider);

  return transactionsAsync.when(
    data: (transactions) {
      final now = DateTime.now();
      final startOfToday = DateTime(now.year, now.month, now.day);
      final endOfToday = startOfToday.add(const Duration(days: 1));

      final filteredTransactions = transactions.where((order) {
        return order.createdAt.isAtSameMomentAs(startOfToday) ||
            (order.createdAt.isAfter(startOfToday) &&
                order.createdAt.isBefore(endOfToday));
      }).toList();

      double totalSales = 0;
      int transactionCount = filteredTransactions.length;

      for (var t in filteredTransactions) {
        if (t.isPaid) {
          totalSales += t.totalPrice;
        }
      }

      return AsyncValue.data({
        'totalSales': totalSales,
        'transactionCount': transactionCount,
      });
    },
    loading: () => const AsyncValue.loading(),
    error: (err, stack) => AsyncValue.error(err, stack),
  );
});
