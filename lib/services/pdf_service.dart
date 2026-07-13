import 'dart:io';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:share_plus/share_plus.dart';
import '../models/transaction.dart';

class PdfService {
  Future<void> exportTransactions(
    List<TransactionModel> orders, {
    String? periodLabel,
    String? businessName,
  }) async {
    final pdf = pw.Document();

    final dateFormat = DateFormat('dd/MM/yyyy');
    final timeFormat = DateFormat('HH:mm');
    final priceFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    // Calculate Summary Stats
    double totalRevenue = 0;
    double totalPaid = 0;
    double totalUnpaid = 0;
    for (var o in orders) {
      totalRevenue += o.totalPrice;
      if (o.isPaid) {
        totalPaid += o.totalPrice;
      } else {
        totalUnpaid += o.totalPrice;
      }
    }

    // Build PDF Layout
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(32),
        build: (pw.Context context) {
          return [
            // Header (Kop Surat)
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      businessName?.toUpperCase() ?? "KINIPOS",
                      style: pw.TextStyle(
                        fontSize: 20,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColor.fromHex('#2D2D2D'),
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      "Laporan Transaksi & Keuangan Toko",
                      style: const pw.TextStyle(
                        fontSize: 11,
                        color: PdfColors.grey700,
                      ),
                    ),
                    if (periodLabel != null) ...[
                      pw.SizedBox(height: 4),
                      pw.Text(
                        "Periode: ${periodLabel.replaceAll('Export_', '').replaceAll('_sd_', ' s/d ')}",
                        style: pw.TextStyle(
                          fontSize: 9,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.grey600,
                        ),
                      ),
                    ],
                    pw.SizedBox(height: 4),
                    pw.Text(
                      "Omzet: ${priceFormat.format(totalRevenue)}  |  Lunas: ${priceFormat.format(totalPaid)}  |  Piutang: ${priceFormat.format(totalUnpaid)}",
                      style: pw.TextStyle(
                        fontSize: 8.5,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.grey700,
                      ),
                    ),
                  ],
                ),
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Text(
                      "KiniPos POS",
                      style: pw.TextStyle(
                        fontSize: 14,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColor.fromHex('#C5A059'),
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      "Tanggal Cetak: ${dateFormat.format(DateTime.now())}",
                      style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey500),
                    ),
                  ],
                ),
              ],
            ),
            pw.SizedBox(height: 16),
            pw.Divider(thickness: 1.5, color: PdfColor.fromHex('#DEE2E6')),
            pw.SizedBox(height: 16),

            // Table Header Title
            pw.Text(
              "Detail Transaksi",
              style: pw.TextStyle(
                fontSize: 12,
                fontWeight: pw.FontWeight.bold,
                color: PdfColor.fromHex('#2D2D2D'),
              ),
            ),
            pw.SizedBox(height: 8),

            // Transactions Table
            pw.Table.fromTextArray(
              border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
              columnWidths: {
                0: const pw.FixedColumnWidth(20),
                1: const pw.FixedColumnWidth(55),
                2: const pw.FlexColumnWidth(2),
                3: const pw.FlexColumnWidth(3),
                4: const pw.FixedColumnWidth(65),
                5: const pw.FixedColumnWidth(50),
              },
              headers: ['No', 'Tanggal', 'Pelanggan', 'Layanan', 'Total', 'Bayar'],
              data: List<List<String>>.generate(orders.length, (index) {
                final o = orders[index];
                final productSummary = o.items
                    .map((i) =>
                        '${i.productName} x${i.quantity % 1 == 0 ? i.quantity.toInt() : i.quantity}')
                    .join(', ');
                return [
                  '${index + 1}',
                  '${dateFormat.format(o.createdAt)}\n${timeFormat.format(o.createdAt)}',
                  o.customerName,
                  productSummary,
                  priceFormat.format(o.totalPrice).replaceAll('Rp ', ''),
                  o.isPaid ? 'LUNAS' : 'BELUM',
                ];
              }),
              headerStyle: pw.TextStyle(
                fontSize: 8,
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.white,
              ),
              headerDecoration: pw.BoxDecoration(
                color: PdfColor.fromHex('#2D2D2D'),
              ),
              cellStyle: const pw.TextStyle(fontSize: 8),
              cellAlignment: pw.Alignment.centerLeft,
            ),
          ];
        },
        footer: (pw.Context context) {
          return pw.Container(
            alignment: pw.Alignment.centerRight,
            margin: const pw.EdgeInsets.only(top: 24),
            decoration: const pw.BoxDecoration(
              border: pw.Border(top: pw.BorderSide(color: PdfColors.grey300, width: 0.5)),
            ),
            padding: const pw.EdgeInsets.only(top: 8),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text(
                  "Laporan ini dibuat otomatis oleh KiniPos",
                  style: pw.TextStyle(fontSize: 8, color: PdfColors.grey500, fontStyle: pw.FontStyle.italic),
                ),
                pw.Text(
                  "Halaman ${context.pageNumber} dari ${context.pagesCount}",
                  style: pw.TextStyle(fontSize: 8, color: PdfColors.grey500),
                ),
              ],
            ),
          );
        },
      ),
    );

    // Save and Share the PDF file
    final output = await getTemporaryDirectory();
    String timestamp = DateFormat('yyyyMMdd_HHmmss').format(DateTime.now());
    String pLabel = periodLabel != null ? '_$periodLabel' : '';
    String bName = businessName != null
        ? businessName.replaceAll(RegExp(r'[^\w\s-]'), '').replaceAll(' ', '_')
        : 'KiniPos';
    String fileName = 'Laporan_Toko_${bName}${pLabel}_$timestamp.pdf';
    final file = File("${output.path}/$fileName");
    await file.writeAsBytes(await pdf.save());

    await Share.shareXFiles(
      [XFile(file.path)],
      text: 'Laporan Transaksi KiniPos (PDF)',
    );
  }

  static pw.Widget _buildStatCard(String title, String value, PdfColor textColor) {
    return pw.Expanded(
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(
            title.toUpperCase(),
            style: const pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.grey600),
          ),
          pw.SizedBox(height: 3),
          pw.Text(
            value,
            style: pw.TextStyle(
              fontSize: 12,
              fontWeight: pw.FontWeight.bold,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  static pw.Widget _buildDivider() {
    return pw.Container(
      height: 20,
      width: 1,
      color: PdfColor.fromHex('#DEE2E6'),
      margin: const pw.EdgeInsets.symmetric(horizontal: 12),
    );
  }
}
