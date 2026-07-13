import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import '../../providers/data_provider.dart' as dp;
import '../../providers/auth_provider.dart';
import '../../models/transaction.dart';
import '../../services/excel_service.dart';
import '../../services/pdf_service.dart';

class RecapScreen extends ConsumerStatefulWidget {
  const RecapScreen({super.key});

  @override
  ConsumerState<RecapScreen> createState() => _RecapScreenState();
}

class _RecapScreenState extends ConsumerState<RecapScreen> {
  DateTimeRange? _selectedDateRange;
  String _activePeriodFilter = '7_days'; // 'today', '7_days', 'month', 'custom'

  final currencyFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  @override
  void initState() {
    super.initState();
    _applyPeriodFilter('7_days');
  }

  void _applyPeriodFilter(String filter) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    setState(() {
      _activePeriodFilter = filter;
      if (filter == 'today') {
        _selectedDateRange = DateTimeRange(start: today, end: today);
      } else if (filter == '7_days') {
        _selectedDateRange = DateTimeRange(
          start: today.subtract(const Duration(days: 6)),
          end: today,
        );
      } else if (filter == 'month') {
        _selectedDateRange = DateTimeRange(
          start: DateTime(now.year, now.month, 1),
          end: today,
        );
      }
    });
  }

  Future<void> _selectCustomDateRange() async {
    final now = DateTime.now();

    // 1. Tampilkan pilihan tahun terlebih dahulu
    final selectedYear = await showDialog<int>(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Pilih Tahun Laporan',
            style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 16),
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: 7, // Menampilkan tahun dari 2020 hingga tahun sekarang
              itemBuilder: (context, index) {
                final year = now.year - index;
                if (year < 2020) return const SizedBox.shrink();
                return ListTile(
                  title: Text(
                    year.toString(),
                    style: GoogleFonts.outfit(fontWeight: FontWeight.w500),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => Navigator.pop(context, year),
                );
              },
            ),
          ),
        );
      },
    );

    if (selectedYear == null) return;

    // 2. Tampilkan pilihan bulan dalam bentuk grid 3x4
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    if (!context.mounted) return;

    final selectedMonth = await showDialog<int>(
      context: context,
      builder: (context) {
        final currentYear = now.year;
        final currentMonth = now.month;
        final maxMonthIndex = (selectedYear == currentYear) ? currentMonth : 12;

        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Pilih Bulan Laporan',
            style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 16),
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 1.5,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: maxMonthIndex,
              itemBuilder: (context, index) {
                final monthNum = index + 1;
                return InkWell(
                  onTap: () => Navigator.pop(context, monthNum),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey[300]!),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      months[index],
                      style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF2D2D2D)),
                    ),
                  ),
                );
              },
            ),
          ),
        );
      },
    );

    if (selectedMonth == null) return;

    // 3. Tampilkan kalender range picker yang langsung diarahkan ke tahun dan bulan yang dipilih
    final startOfChosenMonth = DateTime(selectedYear, selectedMonth, 1);
    final lastDay = DateTime(selectedYear, selectedMonth + 1, 0).day;
    final endOfChosenMonth = DateTime(selectedYear, selectedMonth, lastDay);
    final calendarLastDate = endOfChosenMonth.isAfter(now) ? now : endOfChosenMonth;

    if (!context.mounted) return;

    final picked = await showDateRangePicker(
      context: context,
      initialDateRange: DateTimeRange(
        start: startOfChosenMonth,
        end: calendarLastDate,
      ),
      firstDate: DateTime(2020),
      lastDate: now,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFFC5A059),
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Color(0xFF2D2D2D),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedDateRange = picked;
        _activePeriodFilter = 'custom';
      });
    }
  }

  Future<void> _executeExport(bool isExcel, List<TransactionModel> orders) async {
    final userProfile = ref.read(userProfileProvider).value;
    final businessName = userProfile?.businessName ?? 'KiniPos';

    final df = DateFormat('dd-MM-yyyy');
    final periodLabel = 'Export_${df.format(_selectedDateRange!.start)}_sd_${df.format(_selectedDateRange!.end)}';

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => Center(
          child: Lottie.asset(
            'assets/loading_dots_blue.json',
            width: 100,
            height: 100,
          ),
        ),
      );

      if (isExcel) {
        await ExcelService().exportTransactions(
          orders,
          periodLabel: periodLabel,
          businessName: businessName,
        );
      } else {
        await PdfService().exportTransactions(
          orders,
          periodLabel: periodLabel,
          businessName: businessName,
        );
      }

      if (mounted) {
        Navigator.pop(context); // Dismiss loading
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isExcel ? 'Berhasil ekspor Excel!' : 'Berhasil ekspor PDF!'),
            backgroundColor: const Color(0xFF2D2D2D),
          ),
        );
      }
    } catch (e) {
      if (mounted) Navigator.pop(context);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal ekspor: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(dp.transactionsProvider);
    final df = DateFormat('dd MMM yyyy', 'id_ID');

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: Text(
          'Rekap Laundry',
          style: GoogleFonts.outfit(
            color: const Color(0xFF2D2D2D),
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: ordersAsync.when(
        data: (orders) {
          // Filter by date range
          final startDate = _selectedDateRange!.start;
          final endDate = _selectedDateRange!.end.add(const Duration(hours: 23, minutes: 59, seconds: 59));

          final filteredOrders = orders.where((o) {
            return o.createdAt.isAfter(startDate.subtract(const Duration(milliseconds: 1))) &&
                o.createdAt.isBefore(endDate);
          }).toList();

          // Calculate stats
          double totalOmzet = 0;
          double totalLunas = 0;
          double totalPiutang = 0;
          for (var o in filteredOrders) {
            totalOmzet += o.totalPrice;
            if (o.isPaid) {
              totalLunas += o.totalPrice;
            } else {
              totalPiutang += o.totalPrice;
            }
          }

          return Column(
            children: [
              // 1. Filter Section
              Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Column(
                  children: [
                    Row(
                      children: [
                        _buildFilterButton('Hari Ini', 'today'),
                        const SizedBox(width: 8),
                        _buildFilterButton('7 Hari', '7_days'),
                        const SizedBox(width: 8),
                        _buildFilterButton('Bulan Ini', 'month'),
                        const SizedBox(width: 8),
                        _buildFilterButton('Kustom', 'custom', isCustomTrigger: true),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.date_range_rounded, size: 16, color: Colors.grey),
                            const SizedBox(width: 6),
                            Text(
                              'Periode: ${df.format(startDate)} - ${df.format(_selectedDateRange!.end)}',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                color: Colors.grey[700],
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          '${filteredOrders.length} Order',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            color: const Color(0xFFC5A059),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // 2. Transaction List
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Rincian Transaksi',
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF2D2D2D),
                        ),
                      ),
                      const SizedBox(height: 10),

                      if (filteredOrders.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.all(40),
                            child: Column(
                              children: [
                                Icon(Icons.receipt_long_rounded, size: 48, color: Colors.grey[300]),
                                const SizedBox(height: 12),
                                Text(
                                  'Tidak ada transaksi di periode ini',
                                  style: GoogleFonts.outfit(color: Colors.grey[500], fontSize: 14),
                                ),
                              ],
                            ),
                          ),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: filteredOrders.length,
                          itemBuilder: (context, i) {
                            final o = filteredOrders[i];
                            return Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.grey.withOpacity(0.06)),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          o.customerName,
                                          style: GoogleFonts.outfit(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 14,
                                            color: const Color(0xFF2D2D2D),
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          '${o.items.length} layanan • ${o.paymentMethod}',
                                          style: GoogleFonts.outfit(
                                            color: Colors.grey[500],
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        currencyFormat.format(o.totalPrice),
                                        style: GoogleFonts.outfit(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14,
                                          color: const Color(0xFF2D2D2D),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        o.isPaid ? 'Lunas' : 'Belum Lunas',
                                        style: GoogleFonts.outfit(
                                          color: o.isPaid ? const Color(0xFF2E7D32) : const Color(0xFFD32F2F),
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ),

              // 3. Persistent Summary & Export Panel
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 10,
                      offset: const Offset(0, -4),
                    ),
                  ],
                  border: Border(top: BorderSide(color: Colors.grey.withOpacity(0.08))),
                ),
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
                child: SafeArea(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildMinStatItem('Omzet', totalOmzet, const Color(0xFFC5A059)),
                          _buildDividerBar(),
                          _buildMinStatItem('Lunas', totalLunas, const Color(0xFF2E7D32)),
                          _buildDividerBar(),
                          _buildMinStatItem('Piutang', totalPiutang, const Color(0xFFD32F2F)),
                        ],
                      ),
                      if (filteredOrders.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => _executeExport(false, filteredOrders),
                                icon: const Icon(Icons.picture_as_pdf_rounded, size: 16),
                                label: Text('Ekspor PDF', style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 13)),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: const Color(0xFFD32F2F),
                                  side: const BorderSide(color: Color(0xFFD32F2F)),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => _executeExport(true, filteredOrders),
                                icon: const Icon(Icons.table_chart_rounded, size: 16),
                                label: Text('Ekspor Excel', style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 13)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF2E7D32),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  elevation: 0,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => Center(
          child: Lottie.asset(
            'assets/loading_dots_blue.json',
            width: 150,
            height: 150,
          ),
        ),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildMinStatItem(String label, double value, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: GoogleFonts.outfit(
            fontSize: 9,
            fontWeight: FontWeight.w600,
            color: Colors.grey[500],
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          currencyFormat.format(value),
          style: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildDividerBar() {
    return Container(
      height: 24,
      width: 1,
      color: Colors.grey[200],
    );
  }

  Widget _buildFilterButton(String label, String value, {bool isCustomTrigger = false}) {
    final isSelected = _activePeriodFilter == value;
    return Expanded(
      child: GestureDetector(
        onTap: isCustomTrigger ? _selectCustomDateRange : () => _applyPeriodFilter(value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFC5A059) : Colors.grey[100],
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : Colors.grey[700],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryGridCard({
    required String title,
    required String value,
    required String label,
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
            color: Colors.black.withOpacity(0.01),
            blurRadius: 8,
            offset: const Offset(0, 3),
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
                title,
                style: GoogleFonts.outfit(fontSize: 10, color: Colors.grey[500], fontWeight: FontWeight.w500),
              ),
              Icon(icon, color: color, size: 14),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF2D2D2D),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: GoogleFonts.outfit(fontSize: 9, color: color, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
