import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/data_provider.dart';
import '../providers/auth_provider.dart';
import '../models/transaction.dart';
import 'add_transaction_screen.dart';

class TransactionListScreen extends ConsumerStatefulWidget {
  const TransactionListScreen({super.key});

  @override
  ConsumerState<TransactionListScreen> createState() => _TransactionListScreenState();
}

class _TransactionListScreenState extends ConsumerState<TransactionListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isSearching = false;
  String _searchQuery = '';
  DateTime? _selectedDate;
  final TextEditingController _searchController = TextEditingController();

  final currencyFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF2D2D2D),
              onPrimary: Colors.white,
              onSurface: Color(0xFF2D2D2D),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final transactionsAsync = ref.watch(transactionsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Cari nama pelanggan / HP...',
                  hintStyle: GoogleFonts.outfit(color: Colors.grey[400], fontSize: 14),
                  border: InputBorder.none,
                ),
                style: GoogleFonts.outfit(color: const Color(0xFF2D2D2D), fontSize: 15),
                onChanged: (val) {
                  setState(() {
                    _searchQuery = val.trim().toLowerCase();
                  });
                },
              )
            : Text(
                'Antrean Laundry',
                style: GoogleFonts.outfit(
                  color: const Color(0xFF2D2D2D),
                  fontWeight: FontWeight.w700,
                ),
              ),
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          if (_isSearching)
            IconButton(
              icon: const Icon(Icons.close_rounded, color: Color(0xFF2D2D2D)),
              onPressed: () {
                setState(() {
                  _isSearching = false;
                  _searchQuery = '';
                  _searchController.clear();
                });
              },
            )
          else
            IconButton(
              icon: const Icon(Icons.search_rounded, color: Color(0xFF2D2D2D)),
              onPressed: () {
                setState(() {
                  _isSearching = true;
                });
              },
            ),
          IconButton(
            icon: Icon(
              Icons.calendar_month_rounded,
              color: _selectedDate != null ? const Color(0xFFC5A059) : const Color(0xFF2D2D2D),
            ),
            onPressed: _pickDate,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14),
          unselectedLabelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w400),
          labelColor: Colors.white,
          unselectedLabelColor: Colors.grey[600],
          indicator: BoxDecoration(
            color: const Color(0xFF2D2D2D),
            borderRadius: BorderRadius.circular(0),
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          tabs: const [
            Tab(text: 'Masuk'),
            Tab(text: 'Selesai'),
          ],
        ),
      ),
      body: Column(
        children: [
          if (_selectedDate != null)
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFC5A059).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFC5A059).withOpacity(0.2)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.calendar_today_rounded, size: 12, color: Color(0xFFC5A059)),
                        const SizedBox(width: 6),
                        Text(
                          DateFormat('dd MMMM yyyy', 'id_ID').format(_selectedDate!),
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFFC5A059),
                          ),
                        ),
                        const SizedBox(width: 6),
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedDate = null;
                            });
                          },
                          child: const Icon(Icons.close_rounded, size: 14, color: Color(0xFFC5A059)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          Expanded(
            child: transactionsAsync.when(
              data: (transactions) {
                var filtered = transactions;
                if (_selectedDate != null) {
                  filtered = filtered.where((t) {
                    return t.createdAt.year == _selectedDate!.year &&
                        t.createdAt.month == _selectedDate!.month &&
                        t.createdAt.day == _selectedDate!.day;
                  }).toList();
                }

                if (_searchQuery.isNotEmpty) {
                  filtered = filtered.where((t) {
                    final nameMatch = t.customerName.toLowerCase().contains(_searchQuery);
                    final phoneMatch = t.phoneNumber.toLowerCase().contains(_searchQuery);
                    final servicesMatch = t.items.any((item) => item.productName.toLowerCase().contains(_searchQuery));
                    return nameMatch || phoneMatch || servicesMatch;
                  }).toList();
                }

                final masukList = filtered.where((t) => t.laundryStatus != 'selesai').toList();
                final selesaiList = filtered.where((t) => t.laundryStatus == 'selesai').toList();

                return TabBarView(
                  controller: _tabController,
                  children: [
                    _buildList(masukList, isSelesaiTab: false),
                    _buildList(selesaiList, isSelesaiTab: true),
                  ],
                );
              },
              loading: () => Center(
                child: Lottie.asset('assets/loading_dots_blue.json', width: 150, height: 150),
              ),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const AddTransactionScreen()),
          );
        },
        backgroundColor: const Color(0xFF2D2D2D),
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: Text(
          'Order Baru',
          style: GoogleFonts.outfit(
            color: Colors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  Widget _buildList(List<TransactionModel> items, {required bool isSelesaiTab}) {
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelesaiTab ? Icons.task_alt_rounded : Icons.local_laundry_service_rounded,
              size: 72,
              color: Colors.grey[200],
            ),
            const SizedBox(height: 16),
            Text(
              isSelesaiTab ? 'Belum ada cucian selesai' : 'Tidak ada antrean cucian',
              style: GoogleFonts.outfit(
                fontSize: 16,
                color: Colors.grey[500],
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              isSelesaiTab ? 'Tandai order dari tab Masuk' : 'Tap Order Baru untuk mulai',
              style: GoogleFonts.outfit(fontSize: 13, color: Colors.grey[400]),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      itemCount: items.length,
      itemBuilder: (context, index) => _buildTransactionCard(items[index], isSelesaiTab: isSelesaiTab),
    );
  }

  Widget _buildTransactionCard(TransactionModel tx, {required bool isSelesaiTab}) {
    final df = DateFormat('dd MMM, HH:mm', 'id_ID');
    final isToday = tx.createdAt.day == DateTime.now().day &&
        tx.createdAt.month == DateTime.now().month;
    final timeLabel = isToday
        ? 'Hari Ini, ${DateFormat('HH:mm').format(tx.createdAt)}'
        : df.format(tx.createdAt);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isSelesaiTab ? Colors.green.withOpacity(0.15) : const Color(0xFFC5A059).withOpacity(0.2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header row
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
            child: Row(
              children: [
                Container(
                  width: 10, height: 10,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isSelesaiTab ? const Color(0xFF2E7D32) : const Color(0xFFC5A059),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(tx.customerName,
                        style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 15, color: const Color(0xFF2D2D2D)),
                      ),
                      if (tx.phoneNumber.isNotEmpty)
                        Text(tx.phoneNumber, style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey[500])),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(currencyFormat.format(tx.totalPrice),
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 15, color: const Color(0xFF2D2D2D)),
                        ),
                        const SizedBox(width: 4),
                        _buildCardMenu(tx),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: tx.isPaid ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        tx.isPaid ? 'Lunas' : 'Belum Lunas',
                        style: GoogleFonts.outfit(color: tx.isPaid ? Colors.green[700] : Colors.orange[800], fontSize: 10, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Expandable detail
          Theme(
            data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
            child: ExpansionTile(
              tilePadding: const EdgeInsets.symmetric(horizontal: 16),
              childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              shape: const Border(), collapsedShape: const Border(),
              title: Text('${tx.items.length} layanan • $timeLabel',
                style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey[500]),
              ),
              children: [
                const Divider(height: 1),
                const SizedBox(height: 8),
                ...tx.items.map((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(child: Text(
                        '${item.productName} × ${item.quantity % 1 == 0 ? item.quantity.toInt() : item.quantity} ${item.unit}',
                        style: GoogleFonts.outfit(fontSize: 13, color: const Color(0xFF2D2D2D)),
                      )),
                      Text(currencyFormat.format(item.price * item.quantity),
                        style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF2D2D2D)),
                      ),
                    ],
                  ),
                )),
                const SizedBox(height: 4),
                Row(children: [
                  Icon(Icons.payment_rounded, size: 13, color: Colors.grey[400]),
                  const SizedBox(width: 4),
                  Text(tx.paymentMethod, style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey[500])),
                ]),
                const SizedBox(height: 10),
              ],
            ),
          ),

          // Action buttons row
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: Row(
              children: [
                if (!tx.isPaid) ...[
                  Expanded(
                    child: _actionBtn('Lunas', Icons.attach_money_rounded, const Color(0xFF2E7D32), () async {
                      await ref.read(firestoreServiceProvider).updateTransactionPaymentStatus(tx.id, true);
                    }),
                  ),
                  const SizedBox(width: 6),
                ],
                Expanded(
                  child: _actionBtn(
                    isSelesaiTab ? 'Kembalikan' : 'Selesai',
                    isSelesaiTab ? Icons.undo_rounded : Icons.done_all_rounded,
                    isSelesaiTab ? Colors.grey[600]! : const Color(0xFF2D2D2D),
                    () async {
                      if (isSelesaiTab) {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (context) => AlertDialog(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            title: Text('Kembalikan Antrean?', style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
                            content: Text(
                              'Apakah Anda yakin ingin memindahkan order atas nama "${tx.customerName}" kembali ke antrean "Masuk"?',
                              style: GoogleFonts.outfit(),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context, false),
                                child: Text('Batal', style: GoogleFonts.outfit(color: Colors.grey)),
                              ),
                              ElevatedButton(
                                onPressed: () => Navigator.pop(context, true),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF2D2D2D),
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                                child: Text('Ya, Kembalikan', style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
                              ),
                            ],
                          ),
                        );
                        if (confirm != true) return;
                      }

                      final newStatus = isSelesaiTab ? 'masuk' : 'selesai';
                      await ref.read(firestoreServiceProvider).updateTransactionLaundryStatus(tx.id, newStatus);
                    },
                  ),
                ),
                const SizedBox(width: 6),
                // Print Struk Button
                _iconActionBtn(
                  icon: Icons.print_rounded,
                  color: const Color(0xFFC5A059),
                  tooltip: 'Cetak Struk',
                  onTap: () async {
                    try {
                      final userProfile = ref.read(userProfileProvider).value;
                      final businessName = userProfile?.businessName ?? 'Laundry';
                      await ref.read(printerServiceProvider).printTransactionReceipt(tx, businessName: businessName);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Mengirim struk ke printer...', style: GoogleFonts.outfit()),
                            backgroundColor: const Color(0xFFC5A059),
                          ),
                        );
                      }
                    } catch (e) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Gagal mencetak: $e', style: GoogleFonts.outfit()),
                            backgroundColor: Colors.red,
                          ),
                        );
                      }
                    }
                  },
                ),
                const SizedBox(width: 6),
                // Send WhatsApp Button
                _iconActionBtn(
                  isAssetImage: true,
                  assetPath: 'assets/whatsapp_logo.png',
                  icon: Icons.share_rounded,
                  color: const Color(0xFF25D366),
                  tooltip: 'Kirim WhatsApp',
                  onTap: () {
                    final userProfile = ref.read(userProfileProvider).value;
                    final businessName = userProfile?.businessName ?? 'Laundry';
                    _sendWhatsAppReceipt(context, tx, businessName, isSelesai: isSelesaiTab);
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionBtn(String label, IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 11),
        decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(12)),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 16),
            const SizedBox(width: 4),
            Text(
              label,
              style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _iconActionBtn({
    bool isAssetImage = false,
    String? assetPath,
    required IconData icon,
    required Color color,
    required String tooltip,
    required VoidCallback onTap,
  }) {
    return Tooltip(
      message: tooltip,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withOpacity(0.2), width: 1.5),
          ),
          child: isAssetImage && assetPath != null
              ? Image.asset(
                  assetPath,
                  width: 18,
                  height: 18,
                  fit: BoxFit.contain,
                )
              : Icon(icon, color: color, size: 18),
        ),
      ),
    );
  }

  void _sendWhatsAppReceipt(BuildContext context, TransactionModel tx, String businessName, {bool isSelesai = false}) async {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    final dateFormatter = DateFormat('dd/MM/yyyy HH:mm');

    final itemsText = tx.items.map((item) {
      final qtyLabel = item.quantity % 1 == 0
          ? '${item.quantity.toInt()}'
          : '${item.quantity}';
      return "- ${item.productName} (${qtyLabel} ${item.unit}) : ${currencyFormat.format(item.price * item.quantity)}";
    }).join('\n');

    String message;

    if (isSelesai) {
      // Pesan notifikasi cucian selesai & siap diambil
      message = "*$businessName - CUCIAN SELESAI*\n"
          "-----------------------------------\n"
          "Halo Kak *${tx.customerName}*,\n\n"
          "Cucian Anda sudah *selesai* dan siap untuk diambil!\n"
          "-----------------------------------\n"
          "Rincian Layanan:\n"
          "$itemsText\n"
          "-----------------------------------\n"
          "*TOTAL : ${currencyFormat.format(tx.totalPrice)}*\n"
          "Status : ${tx.isPaid ? 'LUNAS' : 'BELUM LUNAS'}\n"
          "-----------------------------------\n"
          "Silakan diambil di outlet kami ya.\n"
          "Terima kasih! 🙏";
    } else {
      // Struk penerimaan cucian masuk
      message = "*STRUK LAUNDRY - $businessName*\n"
          "-----------------------------------\n"
          "Pelanggan : ${tx.customerName}\n"
          "Tanggal Masuk : ${dateFormatter.format(tx.createdAt)}\n"
          "Status : ${tx.isPaid ? 'LUNAS' : 'BELUM LUNAS'}\n"
          "-----------------------------------\n"
          "Rincian Layanan:\n"
          "$itemsText\n"
          "-----------------------------------\n"
          "*TOTAL : ${currencyFormat.format(tx.totalPrice)}*\n"
          "Metode : ${tx.paymentMethod}\n"
          "-----------------------------------\n"
          "Cucian Anda sedang kami proses.\n"
          "Kami akan kabari jika sudah selesai.\n"
          "Terima kasih! 🙏";
    }

    // Normalize phone number if present, fallback to empty or prompt
    String phone = tx.phoneNumber.replaceAll(RegExp(r'[^0-9]'), '');
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Nomor telepon pelanggan kosong!', style: GoogleFonts.outfit()),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }

    final whatsappUrl = Uri.parse(
      "https://wa.me/$phone?text=${Uri.encodeComponent(message)}",
    );

    try {
      if (await canLaunchUrl(whatsappUrl)) {
        await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication);
      } else {
        throw Exception('Tidak bisa membuka WhatsApp');
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal membuka WhatsApp: $e', style: GoogleFonts.outfit()),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildCardMenu(TransactionModel tx) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.more_vert_rounded, color: Colors.grey, size: 20),
      padding: EdgeInsets.zero,
      constraints: const BoxConstraints(minWidth: 100),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      onSelected: (value) {
        if (value == 'edit') {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => AddTransactionScreen(transaction: tx),
            ),
          );
        } else if (value == 'delete') {
          _confirmDeleteTransaction(tx);
        }
      },
      itemBuilder: (context) => [
        PopupMenuItem(
          value: 'edit',
          child: Row(
            children: [
              const Icon(Icons.edit_rounded, size: 18, color: Colors.blue),
              const SizedBox(width: 8),
              Text('Edit', style: GoogleFonts.outfit(fontSize: 13)),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'delete',
          child: Row(
            children: [
              const Icon(Icons.delete_rounded, size: 18, color: Colors.red),
              const SizedBox(width: 8),
              Text('Hapus', style: GoogleFonts.outfit(fontSize: 13)),
            ],
          ),
        ),
      ],
    );
  }

  void _confirmDeleteTransaction(TransactionModel tx) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Hapus Order?', style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
        content: Text('Apakah Anda yakin ingin menghapus order atas nama "${tx.customerName}"?', style: GoogleFonts.outfit()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Batal', style: GoogleFonts.outfit(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ref.read(firestoreServiceProvider).deleteTransaction(tx.id);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Order berhasil dihapus!', style: GoogleFonts.outfit()),
                      backgroundColor: Colors.redAccent,
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Gagal menghapus order: $e', style: GoogleFonts.outfit()),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text('Hapus', style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}
