import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';
import 'package:blue_thermal_printer/blue_thermal_printer.dart';
import '../providers/data_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {

  @override
  Widget build(BuildContext context) {
    final userProfile = ref.watch(userProfileProvider);
    final user = FirebaseAuth.instance.currentUser;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF333333)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Pengaturan',
          style: GoogleFonts.outfit(
            color: const Color(0xFF333333),
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profil Section
            _buildSectionHeader('Profil'),
            const SizedBox(height: 16),
            _buildProfileInfo(
              'Nama Bisnis',
              userProfile.value?.businessName ?? '-',
              onEdit: () => _showEditBusinessNameDialog(
                userProfile.value?.businessName,
                userProfile.value?.ownerName,
              ),
            ),
            _buildProfileInfo(
              'Nama Pemilik',
              userProfile.value?.ownerName ?? '-',
              onEdit: () => _showEditOwnerNameDialog(
                userProfile.value?.ownerName,
                userProfile.value?.businessName,
              ),
            ),

            const SizedBox(height: 32),

            // Akun Section
            _buildSectionHeader('Akun'),
            const SizedBox(height: 16),
            _buildProfileInfo(
              'Email / Akun Google',
              user?.email ?? '-',
            ),

            const SizedBox(height: 32),

            // Subscription Section
            _buildSectionHeader('Langganan'),
            const SizedBox(height: 16),
            _buildSubscriptionSection(userProfile.value),

            const SizedBox(height: 32),

            // Printer Section
            _buildSectionHeader('Printer Struk (Thermal)'),
            const SizedBox(height: 16),
            _buildPrinterSettings(),

            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () async {
                  await ref.read(authNotifierProvider.notifier).signOut();
                  if (mounted) {
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  }
                },
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: const BorderSide(color: Colors.red),
                  foregroundColor: Colors.red,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  'Keluar',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: GoogleFonts.outfit(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: const Color(0xFF333333),
      ),
    );
  }

  Widget _buildSubscriptionSection(dynamic profile) {
    if (profile == null) return const SizedBox.shrink();

    final bool isSubscription = profile.isSubscriptionActive;
    final bool isTrial = profile.isTrialActive;

    String statusLabel = '';
    Color statusColor = Colors.grey;
    String detailText = '';
    IconData icon = Icons.info_outline;

    if (isSubscription) {
      statusLabel = 'Premium Aktif';
      statusColor = const Color(0xFFC5A059);
      final df = DateFormat('dd MMMM yyyy', 'id_ID');
      detailText = 'Aktif sampai ${df.format(profile.subscriptionUntil!)}';
      icon = Icons.verified_user_outlined;
    } else if (isTrial) {
      statusLabel = 'Masa Trial';
      statusColor = Colors.orange;
      detailText = 'Tersisa ${profile.remainingTrialDays} hari lagi';
      icon = Icons.timer_outlined;
    } else {
      statusLabel = 'Masa Trial Berakhir';
      statusColor = Colors.redAccent;
      detailText = 'Silakan aktifkan akun Premium untuk melanjutkan.';
      icon = Icons.timer_off_outlined;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: statusColor.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: statusColor,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  statusLabel,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: statusColor,
                  ),
                ),
                Text(
                  detailText,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: Colors.grey[700],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileInfo(String label, String value, {VoidCallback? onEdit}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
              if (onEdit != null)
                GestureDetector(
                  onTap: onEdit,
                  child: Text(
                    'Ubah',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      color: const Color(0xFF333333),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 16,
              color: const Color(0xFF333333),
            ),
          ),
          const Divider(),
        ],
      ),
    );
  }

  void _showEditBusinessNameDialog(String? currentName, String? ownerName) {
    final controller = TextEditingController(text: currentName);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Ubah Nama Bisnis',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
        ),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(labelText: 'Nama Bisnis Baru'),
          textCapitalization: TextCapitalization.words,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Batal',
              style: GoogleFonts.outfit(color: Colors.grey),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              final newName = controller.text.trim();
              if (newName.isEmpty) return;

              final success = await ref
                  .read(authNotifierProvider.notifier)
                  .saveProfile(
                    businessName: newName,
                    ownerName: ownerName ?? '',
                  );

              if (mounted && success) {
                ref.invalidate(userProfileProvider);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Nama bisnis berhasil diperbarui!'),
                    backgroundColor: Color(0xFF333333),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF333333),
              foregroundColor: Colors.white,
            ),
            child: Text('Simpan', style: GoogleFonts.outfit()),
          ),
        ],
      ),
    );
  }

  void _showEditOwnerNameDialog(String? currentName, String? businessName) {
    final controller = TextEditingController(text: currentName);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Ubah Nama Pemilik',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
        ),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(labelText: 'Nama Pemilik Baru'),
          textCapitalization: TextCapitalization.words,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Batal',
              style: GoogleFonts.outfit(color: Colors.grey),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              final newName = controller.text.trim();
              if (newName.isEmpty) return;

              final success = await ref
                  .read(authNotifierProvider.notifier)
                  .saveProfile(
                    ownerName: newName,
                    businessName: businessName ?? '',
                  );

              if (mounted && success) {
                ref.invalidate(userProfileProvider);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Nama pemilik berhasil diperbarui!'),
                    backgroundColor: Color(0xFF333333),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF333333),
              foregroundColor: Colors.white,
            ),
            child: Text('Simpan', style: GoogleFonts.outfit()),
          ),
        ],
      ),
    );
  }

  Widget _buildPrinterSettings() {
    final printerService = ref.watch(printerServiceProvider);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Printer Terhubung (Paired)',
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
              IconButton(
                onPressed: () {
                  setState(() {}); // Refresh list
                },
                icon: const Icon(Icons.refresh, size: 20, color: Color(0xFFC5A059)),
                tooltip: 'Refresh List',
              ),
            ],
          ),
          const SizedBox(height: 8),
          FutureBuilder<List<BluetoothDevice>>(
            future: printerService.getBondedDevices(),
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              }
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              if (!snapshot.hasData || snapshot.data!.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: Center(
                    child: Text('Belum ada printer yang dipairing di HP.'),
                  ),
                );
              }

              final devices = snapshot.data!;
              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: devices.length,
                separatorBuilder: (_, __) => const Divider(),
                itemBuilder: (context, index) {
                  final device = devices[index];

                  return StreamBuilder<int?>(
                    stream: printerService.stateStream,
                    builder: (context, stateSnapshot) {
                      // BlueThermalPrinter state:
                      // Connected = 1
                      // Disconnected = 0?
                      // Actually let's just use service.isConnected() check if we want,
                      // or rely on manual connect for simplicity first.
                      // Or better: show connected status if printerService.connectedPrinter == device?
                      // Accessing private field is hard.
                      // But the 'connect' button handles logic.

                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.print, color: Colors.grey),
                        title: Text(device.name ?? 'Unknown Device'),
                        subtitle: Text(device.address ?? 'No Address'),
                        trailing: ElevatedButton(
                          onPressed: () async {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Menghubungkan...'),
                                duration: Duration(seconds: 1),
                              ),
                            );
                            try {
                              await printerService.connect(device);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Printer Terhubung!'),
                                      backgroundColor: Color(0xFF0B192C),
                                    ),
                                );
                              }
                            } catch (e) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Gagal: $e'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                          style: ElevatedButton.styleFrom(
                             backgroundColor: const Color(0xFF0B192C),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                          ),
                          child: const Text('Connect'),
                        ),
                      );
                    },
                  );
                },
              );
            },
          ),
          const SizedBox(height: 8),
          Text(
            'tips: Pastikan printer sudah dipairing di pengaturan Bluetooth HP ya Boss.',
            style: GoogleFonts.outfit(
              fontSize: 11,
              color: Colors.grey,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

}
