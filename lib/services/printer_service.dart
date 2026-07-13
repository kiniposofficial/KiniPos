import 'dart:async';
import 'package:blue_thermal_printer/blue_thermal_printer.dart';
import 'package:intl/intl.dart';
import '../models/transaction.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/foundation.dart';

class PrinterService {
  final BlueThermalPrinter _printer = BlueThermalPrinter.instance;

  // Keep track of connected printer
  BluetoothDevice? _connectedPrinter;

  // Stream of printer state (connected/disconnected)
  Stream<int?> get stateStream => _printer.onStateChanged();

  Future<List<BluetoothDevice>> getBondedDevices() async {
    if (defaultTargetPlatform == TargetPlatform.windows) {
      return []; // Bluetooth printing not supported on Windows yet
    }

    // Check permissions first
    if (await Permission.bluetoothConnect.status.isDenied) {
      await Permission.bluetoothConnect.request();
    }

    try {
      return await _printer.getBondedDevices();
    } catch (e) {
      return [];
    }
  }

  Future<bool> isConnected() async {
    if (defaultTargetPlatform == TargetPlatform.windows) return false;
    try {
      final bool? connected = await _printer.isConnected;
      if (connected != true) return false;

      final devices = await _printer.getBondedDevices();
      return devices.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  Future<void> connect(BluetoothDevice device) async {
    if (defaultTargetPlatform == TargetPlatform.windows) return;
    if ((await _printer.isConnected) == true) {
      await _printer.disconnect();
    }
    await _printer.connect(device);
    _connectedPrinter = device;
  }

  Future<void> disconnect() async {
    if (defaultTargetPlatform == TargetPlatform.windows) return;
    await _printer.disconnect();
    _connectedPrinter = null;
  }

  Future<void> printTransactionReceipt(
    TransactionModel order, {
    String? businessName,
  }) async {
    if (defaultTargetPlatform == TargetPlatform.windows) {
      debugPrint("Printing is not supported on Windows Desktop yet.");
      return;
    }

    if ((await _printer.isConnected) != true) {
      if (_connectedPrinter != null) {
        try {
          await _printer.connect(_connectedPrinter!);
        } catch (e) {
          throw Exception('Printer not connected and reconnect failed');
        }
      } else {
        throw Exception('Printer tidak terhubung ke Bluetooth');
      }
    }

    final priceFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: '',
      decimalDigits: 0,
    );

    // Header
    _printer.printCustom(businessName ?? "KINIPOS", 3, 1); // Size 3, Center
    _printer.printCustom("Struk Transaksi", 1, 1);
    _printer.printNewLine();

    // Date & Customer
    final dateFormatter = DateFormat('dd/MM/yyyy HH:mm');
    _printer.printLeftRight(
      "Tgl: ${dateFormatter.format(order.createdAt)}",
      "",
      0,
    );
    _printer.printCustom("Pelanggan: ${order.customerName}", 1, 0);
    if (order.phoneNumber.isNotEmpty) {
      _printer.printCustom("HP: ${order.phoneNumber}", 1, 0);
    }
    _printer.printCustom("--------------------------------", 1, 1);

    // Item list
    for (var item in order.items) {
      final qtyLabel = item.quantity % 1 == 0
          ? '${item.quantity.toInt()}'
          : '${item.quantity}';
      _printer.printCustom(item.productName, 1, 0);
      _printer.printLeftRight(
        "  $qtyLabel ${item.unit} x Rp ${priceFormat.format(item.price)}",
        "Rp ${priceFormat.format(item.price * item.quantity)}",
        0,
      );
    }

    _printer.printCustom("--------------------------------", 1, 1);

    // Total
    _printer.printLeftRight(
      "TOTAL",
      "Rp ${priceFormat.format(order.totalPrice)}",
      1,
    );

    _printer.printNewLine();
    _printer.printCustom("Bayar: ${order.paymentMethod}", 1, 1);
    _printer.printCustom("Status: ${order.isPaid ? 'LUNAS' : 'BELUM LUNAS'}", 1, 1);
    _printer.printNewLine();
    _printer.printCustom("Terima Kasih", 1, 1);
    _printer.printCustom("Powered by KiniPos", 0, 1);
    _printer.printNewLine();
    _printer.printNewLine();
    _printer.paperCut();
  }
}

