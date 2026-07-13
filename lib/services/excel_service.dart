import 'dart:io';
import 'package:excel/excel.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:intl/intl.dart';
import '../models/transaction.dart';

class ExcelService {
  Future<void> exportTransactions(
    List<TransactionModel> orders, {
    String? periodLabel,
    String? businessName,
  }) async {
    var excel = Excel.createExcel();
    String firstSheetName = excel.sheets.keys.first;
    Sheet sheetObject = excel[firstSheetName];

    // Headers
    List<String> headers = [
      'No.',
      'Tanggal',
      'Jam',
      'Nama Pelanggan',
      'No. HP',
      'Produk',
      'Jumlah Item',
      'Total Harga',
      'Metode Bayar',
      'Status Pembayaran',
    ];
    sheetObject.appendRow(headers.map((e) => TextCellValue(e)).toList());

    final dateFormat = DateFormat('dd/MM/yyyy');
    final timeFormat = DateFormat('HH:mm');
    int rowCount = 1;

    for (var o in orders) {
      final priceFormat = NumberFormat.currency(
        locale: 'id_ID',
        symbol: '',
        decimalDigits: 0,
      );

      final productSummary = o.items
          .map((i) =>
              '${i.productName} x${i.quantity % 1 == 0 ? i.quantity.toInt() : i.quantity} ${i.unit}')
          .join(', ');

      final row = [
        TextCellValue('$rowCount'),
        TextCellValue(dateFormat.format(o.createdAt)),
        TextCellValue(timeFormat.format(o.createdAt)),
        TextCellValue(o.customerName),
        TextCellValue(o.phoneNumber),
        TextCellValue(productSummary),
        TextCellValue('${o.items.length} item'),
        TextCellValue(priceFormat.format(o.totalPrice).trim()),
        TextCellValue(o.paymentMethod),
        TextCellValue(o.isPaid ? 'LUNAS' : 'BELUM LUNAS'),
      ];

      sheetObject.appendRow(row);
      rowCount++;
    }

    // Grand Total
    final totalRevenue = orders.fold<double>(0, (sum, o) => sum + o.totalPrice);
    final totalPaid = orders.where((o) => o.isPaid).fold<double>(0, (sum, o) => sum + o.totalPrice);
    final priceFormatTotal = NumberFormat.currency(locale: 'id_ID', symbol: '', decimalDigits: 0);

    sheetObject.appendRow([]);
    sheetObject.appendRow([
      TextCellValue(''),
      TextCellValue(''),
      TextCellValue(''),
      TextCellValue(''),
      TextCellValue(''),
      TextCellValue('TOTAL OMZET'),
      TextCellValue(''),
      TextCellValue(priceFormatTotal.format(totalRevenue).trim()),
      TextCellValue(''),
      TextCellValue(''),
    ]);
    sheetObject.appendRow([
      TextCellValue(''),
      TextCellValue(''),
      TextCellValue(''),
      TextCellValue(''),
      TextCellValue(''),
      TextCellValue('TOTAL LUNAS'),
      TextCellValue(''),
      TextCellValue(priceFormatTotal.format(totalPaid).trim()),
      TextCellValue(''),
      TextCellValue(''),
    ]);

    // Save and Share
    var fileBytes = excel.save();
    var directory = await getTemporaryDirectory();
    String timestamp = DateFormat('yyyyMMdd_HHmmss').format(DateTime.now());
    String pLabel = periodLabel != null ? '_$periodLabel' : '';
    String bName = businessName != null
        ? businessName.replaceAll(RegExp(r'[^\w\s-]'), '').replaceAll(' ', '_')
        : 'KiniPos';
    String fileName = 'Laporan_Toko_${bName}${pLabel}_$timestamp.xlsx';
    File file = File('${directory.path}/$fileName');

    if (fileBytes != null) {
      await file.writeAsBytes(fileBytes);
      await Share.shareXFiles([XFile(file.path)], text: 'Laporan Transaksi KiniPos');
    }
  }
}
