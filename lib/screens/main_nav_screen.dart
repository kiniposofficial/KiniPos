import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/auth_provider.dart';
import 'subscription_expired_screen.dart';
import '../providers/nav_provider.dart';
import 'dashboard_screen.dart';
import 'transaction_list_screen.dart';
import 'products_screen.dart';
import 'reports/recap_screen.dart';

class MainNavScreen extends ConsumerWidget {
  const MainNavScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userProfile = ref.watch(userProfileProvider).value;
    if (userProfile != null && !userProfile.canAccess) {
      return const SubscriptionExpiredScreen();
    }

    final currentIndex = ref.watch(mainNavIndexProvider);

    final screens = [
      const DashboardScreen(),
      const TransactionListScreen(),
      const ProductsScreen(),
      const RecapScreen(),
    ];

    return Scaffold(
      body: screens[currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: (index) {
            ref.read(mainNavIndexProvider.notifier).state = index;
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: const Color(0xFFC5A059),
          unselectedItemColor: Colors.grey[400],
          selectedLabelStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w600,
            fontSize: 12,
          ),
          unselectedLabelStyle: GoogleFonts.outfit(
            fontWeight: FontWeight.w500,
            fontSize: 12,
          ),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_rounded),
              label: 'Beranda',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.local_laundry_service_rounded),
              label: 'Antrean',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.dry_cleaning_rounded),
              label: 'Layanan',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.analytics_rounded),
              label: 'Rekap',
            ),
          ],
        ),
      ),
    );
  }
}
