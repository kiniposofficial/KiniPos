import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../models/product.dart';
import '../models/transaction.dart';
import '../providers/data_provider.dart';
import '../utils/currency_formatter.dart';

// Keranjang belanja state
class _CartItem {
  final Product product;
  double quantity;

  _CartItem({required this.product, required this.quantity});

  double get subtotal => product.price * quantity;
}

class AddTransactionScreen extends ConsumerStatefulWidget {
  final TransactionModel? transaction;
  const AddTransactionScreen({super.key, this.transaction});

  @override
  ConsumerState<AddTransactionScreen> createState() => _AddTransactionScreenState();
}

class _AddTransactionScreenState extends ConsumerState<AddTransactionScreen> {
  final _customerNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final List<_CartItem> _cart = [];
  String _paymentMethod = 'Tunai';
  bool _isPaid = true;
  bool _isLoading = false;

  final currencyFormat = NumberFormat.currency(
    locale: 'id_ID',
    symbol: 'Rp ',
    decimalDigits: 0,
  );

  double get _totalPrice => _cart.fold(0, (sum, item) => sum + item.subtotal);

  @override
  void initState() {
    super.initState();
    if (widget.transaction != null) {
      final tx = widget.transaction!;
      _customerNameController.text = tx.customerName == 'Pelanggan Umum' ? '' : tx.customerName;
      _phoneController.text = tx.phoneNumber;
      _paymentMethod = tx.paymentMethod;
      _isPaid = tx.isPaid;
      
      for (var item in tx.items) {
        final dummyProduct = Product(
          id: item.productId,
          name: item.productName,
          price: item.price,
          unit: item.unit,
          stock: 9999,
          userId: tx.userId,
          createdAt: tx.createdAt,
        );
        _cart.add(_CartItem(product: dummyProduct, quantity: item.quantity));
      }
    }
  }

  void _addToCart(Product product) {
    setState(() {
      final existing = _cart.indexWhere((c) => c.product.id == product.id);
      if (existing >= 0) {
        _cart[existing].quantity += 1;
      } else {
        _cart.add(_CartItem(product: product, quantity: 1));
      }
    });
  }

  void _removeFromCart(int index) {
    setState(() => _cart.removeAt(index));
  }

  void _updateQty(int index, double qty) {
    setState(() {
      if (qty <= 0) {
        _cart.removeAt(index);
      } else {
        _cart[index].quantity = qty;
      }
    });
  }

  Future<void> _submitTransaction() async {
    if (_customerNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Nama pelanggan harus diisi!', style: GoogleFonts.outfit()),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Keranjang masih kosong!', style: GoogleFonts.outfit()),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final items = _cart.map((c) => TransactionItem(
        productId: c.product.id,
        productName: c.product.name,
        price: c.product.price,
        quantity: c.quantity,
        unit: c.product.unit,
      )).toList();

      final tx = TransactionModel(
        id: widget.transaction?.id ?? '',
        userId: widget.transaction?.userId ?? '',
        customerName: _customerNameController.text.trim().isEmpty
            ? 'Pelanggan Umum'
            : _customerNameController.text.trim(),
        phoneNumber: _phoneController.text.trim(),
        items: items,
        totalPrice: _totalPrice,
        isPaid: _isPaid,
        paymentMethod: _paymentMethod,
        createdAt: widget.transaction?.createdAt ?? DateTime.now(),
        laundryStatus: widget.transaction?.laundryStatus ?? 'masuk',
      );

      if (widget.transaction != null) {
        await ref.read(firestoreServiceProvider).updateTransaction(tx);
      } else {
        await ref.read(firestoreServiceProvider).addTransaction(tx);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.transaction != null ? 'Order berhasil diperbarui!' : 'Order berhasil disimpan!',
              style: GoogleFonts.outfit(),
            ),
            backgroundColor: const Color(0xFF2E7D32),
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menyimpan: $e', style: GoogleFonts.outfit()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: Text(
          widget.transaction != null ? 'Edit Order Laundry' : 'Order Laundry Baru',
          style: GoogleFonts.outfit(
            color: const Color(0xFF2D2D2D),
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF2D2D2D)),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // -- Info Pelanggan (Opsional) --
                  _buildSectionTitle('Info Pelanggan'),
                  const SizedBox(height: 8),
                  _buildTextField(
                    controller: _customerNameController,
                    label: 'Nama Pelanggan',
                    hint: 'Nama pemilik cucian',
                    icon: Icons.person_outline,
                    textCapitalization: TextCapitalization.words,
                  ),
                  const SizedBox(height: 10),
                  _buildTextField(
                    controller: _phoneController,
                    label: 'No. Telepon',
                    hint: 'Contoh: 08123456789',
                    icon: Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  ),
                  const SizedBox(height: 20),

                  // -- Pilih Produk --
                  _buildSectionTitle('Pilih Layanan'),
                  const SizedBox(height: 8),
                  productsAsync.when(
                    data: (products) {
                      if (products.isEmpty) {
                        return Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.grey[200]!),
                          ),
                          child: Center(
                            child: Text(
                              'Belum ada layanan. Tambah layanan dulu di tab Layanan.',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.outfit(color: Colors.grey),
                            ),
                          ),
                        );
                      }

                      // Hitung kolom responsif berdasarkan lebar layar
                      final screenWidth = MediaQuery.of(context).size.width;
                      final crossAxisCount = screenWidth > 900 ? 5 : (screenWidth > 600 ? 3 : 2);
                      final childAspectRatio = screenWidth > 600 ? 1.3 : 1.5;

                      return GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: crossAxisCount,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                          childAspectRatio: childAspectRatio,
                        ),
                        itemCount: products.length,
                        itemBuilder: (context, i) => _buildProductCard(products[i]),
                      );
                    },
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, _) => Text('Error: $e'),
                  ),
                  const SizedBox(height: 20),

                  // -- Keranjang --
                  if (_cart.isNotEmpty) ...[
                    _buildSectionTitle('Rincian Order (${_cart.length} layanan)'),
                    const SizedBox(height: 8),
                    ..._cart.asMap().entries.map((e) => CartItemRow(
                          key: ValueKey(e.value.product.id),
                          item: e.value,
                          index: e.key,
                          currencyFormat: currencyFormat,
                          onUpdateQty: _updateQty,
                          onRemove: () => _removeFromCart(e.key),
                        )),
                    const SizedBox(height: 20),
                  ],

                  // -- Metode Pembayaran --
                  _buildSectionTitle('Metode & Status Bayar'),
                  const SizedBox(height: 8),
                  _buildPaymentOptions(),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),

          // -- Bottom Summary & Checkout --
          _buildCheckoutBar(),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.outfit(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        color: const Color(0xFF2D2D2D),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    TextCapitalization textCapitalization = TextCapitalization.none,
    List<TextInputFormatter>? inputFormatters,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      textCapitalization: textCapitalization,
      inputFormatters: inputFormatters,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        hintStyle: GoogleFonts.outfit(color: Colors.grey[400], fontSize: 13),
        labelStyle: GoogleFonts.outfit(color: Colors.grey[600]),
        prefixIcon: Icon(icon, color: Colors.grey[400], size: 20),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey[200]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey[200]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFC5A059)),
        ),
      ),
    );
  }

  Widget _buildProductCard(Product product) {
    final isInCart = _cart.any((c) => c.product.id == product.id);
    return GestureDetector(
      onTap: () => _addToCart(product),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isInCart ? const Color(0xFFC5A059).withOpacity(0.08) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isInCart ? const Color(0xFFC5A059) : Colors.grey[200]!,
            width: isInCart ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              product.name,
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.w600,
                fontSize: 13,
                color: const Color(0xFF2D2D2D),
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  currencyFormat.format(product.price),
                  style: GoogleFonts.outfit(
                    color: const Color(0xFFC5A059),
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                  ),
                ),
                Text(
                  '/ ${product.unit}',
                  style: GoogleFonts.outfit(color: Colors.grey, fontSize: 10),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }



  Widget _buildPaymentOptions() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          // Metode Pembayaran
          Row(
            children: ['Tunai', 'Transfer', 'QRIS'].map((method) {
              final selected = _paymentMethod == method;
              return Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _paymentMethod = method),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: selected ? const Color(0xFF2D2D2D) : Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      method,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                        color: selected ? Colors.white : Colors.grey[600],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 4),
          // Status Bayar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Status Pembayaran',
                style: GoogleFonts.outfit(fontWeight: FontWeight.w500, color: Colors.grey[700]),
              ),
              Row(
                children: [
                  Text(
                    _isPaid ? 'Lunas' : 'Belum Bayar',
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.w600,
                      color: _isPaid ? const Color(0xFF2E7D32) : Colors.redAccent,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Switch.adaptive(
                    value: _isPaid,
                    activeColor: const Color(0xFF2E7D32),
                    onChanged: (v) => setState(() => _isPaid = v),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCheckoutBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 14, 20, 28),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Total',
                style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey[600]),
              ),
              Text(
                currencyFormat.format(_totalPrice),
                style: GoogleFonts.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF2D2D2D),
                ),
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: ElevatedButton(
              onPressed: _isLoading ? null : _submitTransaction,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC5A059),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: _isLoading
                  ? const SizedBox(
                      width: 22, height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.white)),
                    )
                  : Text(
                      'Simpan Order',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 15),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class CartItemRow extends StatefulWidget {
  final _CartItem item;
  final int index;
  final Function(int, double) onUpdateQty;
  final VoidCallback onRemove;
  final NumberFormat currencyFormat;

  const CartItemRow({
    super.key,
    required this.item,
    required this.index,
    required this.onUpdateQty,
    required this.onRemove,
    required this.currencyFormat,
  });

  @override
  State<CartItemRow> createState() => _CartItemRowState();
}

class _CartItemRowState extends State<CartItemRow> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    final qty = widget.item.quantity;
    _controller = TextEditingController(
      text: qty % 1 == 0 ? qty.toInt().toString() : qty.toString(),
    );
  }

  @override
  void didUpdateWidget(covariant CartItemRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    final currentVal = double.tryParse(_controller.text) ?? 0.0;
    if (widget.item.quantity != currentVal) {
      final qty = widget.item.quantity;
      _controller.text = qty % 1 == 0 ? qty.toInt().toString() : qty.toString();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.item.product.name,
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 13),
                ),
                Text(
                  widget.currencyFormat.format(widget.item.subtotal),
                  style: GoogleFonts.outfit(color: const Color(0xFFC5A059), fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          Row(
            children: [
              _qtyBtn(Icons.remove, () {
                final currentVal = double.tryParse(_controller.text) ?? 0.0;
                final newVal = currentVal - 1;
                if (newVal >= 0) {
                  widget.onUpdateQty(widget.index, newVal);
                }
              }),
              const SizedBox(width: 6),
              Container(
                width: 90,
                height: 44,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Colors.grey[500]!.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: TextField(
                  controller: _controller,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  textAlign: TextAlign.center,
                  textAlignVertical: TextAlignVertical.center,
                  style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 16),
                  decoration: const InputDecoration(
                    contentPadding: EdgeInsets.symmetric(vertical: 12),
                    isDense: true,
                    border: InputBorder.none,
                  ),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d*')),
                  ],
                  onChanged: (value) {
                    final newQty = double.tryParse(value) ?? 0.0;
                    widget.onUpdateQty(widget.index, newQty);
                  },
                ),
              ),
              const SizedBox(width: 6),
              _qtyBtn(Icons.add, () {
                final currentVal = double.tryParse(_controller.text) ?? 0.0;
                final newVal = currentVal + 1;
                widget.onUpdateQty(widget.index, newVal);
              }),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: widget.onRemove,
                child: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 20),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _qtyBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 18, color: const Color(0xFF2D2D2D)),
      ),
    );
  }
}
