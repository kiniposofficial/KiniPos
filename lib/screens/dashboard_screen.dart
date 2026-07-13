import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart' as dp;
import '../providers/nav_provider.dart';
import 'settings_screen.dart';
import 'subscription_expired_screen.dart';
import '../models/transaction.dart';
import 'add_transaction_screen.dart';
import 'package:lottie/lottie.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userProfile = ref.watch(userProfileProvider);
    final todaySalesAsync = ref.watch(dp.salesSummaryProvider);
    final allTransactionsAsync = ref.watch(dp.transactionsProvider);

    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    if (userProfile.hasValue) {
      final profile = userProfile.value;
      if (profile != null && !profile.canAccess) {
        return const SubscriptionExpiredScreen();
      }

      return Scaffold(
        backgroundColor: const Color(0xFFF8F9FA),
        appBar: AppBar(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          automaticallyImplyLeading: false,
          titleSpacing: 24,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Halo, ${profile?.ownerName ?? "Boss"} 👋',
                style: GoogleFonts.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                  color: const Color(0xFF2D2D2D),
                ),
              ),
              Text(
                profile?.businessName ?? 'KiniPos',
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  fontWeight: FontWeight.w400,
                  letterSpacing: 0.5,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          actions: [
            Consumer(
              builder: (context, ref, child) {
                final isPrinterConnected = ref.watch(dp.printerConnectionProvider).value ?? false;
                
                return Tooltip(
                  message: isPrinterConnected ? 'Printer Terhubung' : 'Printer Tidak Terhubung',
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isPrinterConnected ? const Color(0xFFC5A059).withOpacity(0.1) : Colors.grey.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.print_rounded,
                          size: 16,
                          color: isPrinterConnected ? const Color(0xFFC5A059) : Colors.grey,
                        ),
                        if (isPrinterConnected) ...[
                          const SizedBox(width: 4),
                          Text(
                            'Aktif',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFFC5A059),
                            ),
                          ),
                        ]
                      ],
                    ),
                  ),
                );
              },
            ),
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: IconButton(
                icon: const Icon(
                  Icons.settings_rounded,
                  color: Color(0xFF2D2D2D),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SettingsScreen()),
                  );
                },
              ),
            ),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(dp.salesSummaryProvider);
            ref.invalidate(dp.transactionsProvider);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Welcome Card/Banner with gradient
                _buildWelcomeBanner(profile?.businessName ?? 'Laundry Anda'),
                const SizedBox(height: 24),

                // 2. Today's Stats Title
                Text(
                  'Aktivitas Hari Ini',
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF2D2D2D),
                  ),
                ),
                const SizedBox(height: 12),

                // 3. Stats Grid
                allTransactionsAsync.when(
                  data: (transactions) {
                    final now = DateTime.now();
                    final startOfToday = DateTime(now.year, now.month, now.day);
                    final endOfToday = startOfToday.add(const Duration(days: 1));

                    final todayTransactions = transactions.where((tx) {
                      return tx.createdAt.isAtSameMomentAs(startOfToday) ||
                          (tx.createdAt.isAfter(startOfToday) &&
                              tx.createdAt.isBefore(endOfToday));
                    }).toList();

                    double totalSalesPaid = 0;
                    double totalSalesUnpaid = 0;
                    int transactionsCount = todayTransactions.length;
                    int cucianMasuk = 0;
                    int cucianSelesai = 0;

                    for (var t in todayTransactions) {
                      if (t.isPaid) {
                        totalSalesPaid += t.totalPrice;
                      } else {
                        totalSalesUnpaid += t.totalPrice;
                      }
                      if (t.laundryStatus == 'selesai') {
                        cucianSelesai++;
                      } else {
                        cucianMasuk++;
                      }
                    }

                    final totalAllTimeTransactions = transactions.length;

                    final screenWidth = MediaQuery.of(context).size.width;
                    final crossAxisCount = screenWidth > 600 ? 4 : 2;
                    final childAspectRatio = screenWidth > 600 ? 1.6 : 1.4;

                    return GridView.count(
                      crossAxisCount: crossAxisCount,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: childAspectRatio,
                      children: [
                        _buildStatCard(
                          title: 'Pendapatan (Lunas)',
                          value: currencyFormat.format(totalSalesPaid),
                          icon: Icons.monetization_on_rounded,
                          color: const Color(0xFF2E7D32),
                        ),
                        _buildStatCard(
                          title: 'Belum Dibayar',
                          value: currencyFormat.format(totalSalesUnpaid),
                          icon: Icons.info_outline_rounded,
                          color: const Color(0xFFD32F2F),
                        ),
                        _buildStatCard(
                          title: 'Cucian Masuk',
                          value: '$cucianMasuk Order',
                          icon: Icons.local_laundry_service_rounded,
                          color: const Color(0xFFC5A059),
                        ),
                        _buildStatCard(
                          title: 'Cucian Selesai',
                          value: '$cucianSelesai Order',
                          icon: Icons.task_alt_rounded,
                          color: const Color(0xFF1565C0),
                        ),
                      ],
                    );
                  },
                  loading: () => const Center(
                    child: CircularProgressIndicator(color: Color(0xFFC5A059)),
                  ),
                  error: (e, _) => Text('Gagal memuat status: $e'),
                ),
                const SizedBox(height: 28),

                // 4. Quick Actions
                Text(
                  'Menu Pintar',
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF2D2D2D),
                  ),
                ),
                const SizedBox(height: 12),
                _buildQuickActions(context, ref),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      );
    }

    return userProfile.when(
      data: (_) => const SizedBox.shrink(),
      loading: () => Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Lottie.asset(
            'assets/loading_dots_blue.json',
            width: 150,
            height: 150,
          ),
        ),
      ),
      error: (e, _) => Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text(
                'Error: $e',
                style: GoogleFonts.outfit(color: Colors.redAccent),
              ),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => ref.invalidate(userProfileProvider),
                child: const Text('Refresh Profile'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeBanner(String businessName) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2D2D2D), Color(0xFF4A4A4A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'KiniPos Laundry',
                style: GoogleFonts.outfit(
                  color: const Color(0xFFC5A059),
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                  letterSpacing: 1.5,
                ),
              ),
              const Icon(
                Icons.storefront_rounded,
                color: Color(0xFFC5A059),
                size: 24,
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Kelola laundry-mu lebih mudah hari ini.',
            style: GoogleFonts.outfit(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Semua data order, antrean & laporan diperbarui otomatis.',
            style: GoogleFonts.outfit(
              color: Colors.grey[300],
              fontSize: 12,
              fontWeight: FontWeight.w300,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey.withOpacity(0.08)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.outfit(
                    fontSize: 11,
                    color: Colors.grey[500],
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 4),
              Icon(
                icon,
                color: color,
                size: 18,
              ),
            ],
          ),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF2D2D2D),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context, WidgetRef ref) {
    return Row(
      children: [
        Expanded(
          child: _buildActionBtn(
            label: 'Order Baru',
            icon: Icons.add_circle_outline_rounded,
            color: const Color(0xFFC5A059),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AddTransactionScreen()),
              );
            },
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildActionBtn(
            label: 'Atur Layanan',
            icon: Icons.dry_cleaning_rounded,
            color: const Color(0xFF2D2D2D),
            onTap: () {
              ref.read(mainNavIndexProvider.notifier).state = 2;
            },
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildActionBtn(
            label: 'Rekap Laporan',
            icon: Icons.assessment_outlined,
            color: const Color(0xFF2E7D32),
            onTap: () {
              ref.read(mainNavIndexProvider.notifier).state = 3;
            },
          ),
        ),
      ],
    );
  }

  Widget _buildActionBtn({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.12)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
