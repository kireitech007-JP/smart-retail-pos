<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Kategori table
        Schema::create('kategori', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('nama');
            $table->timestamps();
        });

        // Satuan table
        Schema::create('satuan', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('nama');
            $table->timestamps();
        });

        // Unit (store locations) table
        Schema::create('unit', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('nama');
            $table->text('alamat')->nullable();
            $table->string('telepon')->nullable();
            $table->timestamps();
        });

        // Pengguna (Users) table - extending Laravel default users
        // Since Laravel already has 'users' table, we can use it and add custom fields.
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user');
            $table->string('unit_id')->nullable();
            $table->string('status')->default('active');
            $table->foreign('unit_id')->references('id')->on('unit')->onDelete('set null');
        });

        // Produk table
        Schema::create('produk', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('nama');
            $table->string('sku')->unique()->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('hpp', 10, 2);
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->string('category_id')->nullable();
            $table->string('unit_id')->nullable();
            $table->string('supplier')->nullable();
            $table->string('unit_store_id')->nullable();
            $table->foreign('category_id')->references('id')->on('kategori')->onDelete('set null');
            $table->foreign('unit_id')->references('id')->on('satuan')->onDelete('set null');
            $table->foreign('unit_store_id')->references('id')->on('unit')->onDelete('set null');
            $table->timestamps();
        });

        // Transaksi table
        Schema::create('transaksi', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->timestamp('date');
            $table->string('cashier_name')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('grand_total', 10, 2);
            $table->string('payment_type')->nullable(); // 'cash', 'transfer', 'credit'
            $table->decimal('cash_paid', 10, 2)->nullable();
            $table->decimal('cash_change', 10, 2)->nullable();
            $table->decimal('dp', 10, 2)->default(0);
            $table->string('unit_id')->nullable();
            $table->foreign('unit_id')->references('id')->on('unit')->onDelete('set null');
            $table->timestamps();
        });

        // Transaksi items table
        Schema::create('transaksi_items', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('transaksi_id');
            $table->string('product_id')->nullable();
            $table->string('product_name');
            $table->integer('qty');
            $table->string('unit')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->foreign('transaksi_id')->references('id')->on('transaksi')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('produk')->onDelete('set null');
            $table->timestamps();
        });

        // Piutang table
        Schema::create('piutang', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->decimal('total_amount', 10, 2);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->decimal('remaining_amount', 10, 2);
            $table->string('status')->default('unpaid'); // 'unpaid', 'partial', 'paid'
            $table->text('description')->nullable();
            $table->timestamp('date');
            $table->timestamp('due_date')->nullable();
            $table->string('unit_id')->nullable();
            $table->foreign('unit_id')->references('id')->on('unit')->onDelete('set null');
            $table->timestamps();
        });

        // Kas masuk table
        Schema::create('kas_masuk', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->decimal('amount', 10, 2);
            $table->text('description')->nullable();
            $table->timestamp('date');
            $table->string('cashier_name')->nullable();
            $table->string('unit_id')->nullable();
            $table->foreign('unit_id')->references('id')->on('unit')->onDelete('set null');
            $table->timestamps();
        });

        // Pengeluaran table
        Schema::create('pengeluaran', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->text('description');
            $table->decimal('amount', 10, 2);
            $table->timestamp('date');
            $table->string('unit_id')->nullable();
            $table->unsignedBigInteger('cashier_id')->nullable();
            $table->foreign('unit_id')->references('id')->on('unit')->onDelete('set null');
            $table->foreign('cashier_id')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
        });

        // Sessions table
        Schema::create('sessions_pos', function (Blueprint $table) { // Rename to avoid conflict with Laravel sessions
            $table->string('id')->primary();
            $table->unsignedBigInteger('cashier_id')->nullable();
            $table->string('unit_id')->nullable();
            $table->timestamp('opening_time');
            $table->timestamp('closing_time')->nullable();
            $table->decimal('opening_cash', 10, 2)->default(0);
            $table->decimal('closing_cash', 10, 2)->nullable();
            $table->decimal('total_sales', 10, 2)->default(0);
            $table->decimal('total_cash_in', 10, 2)->default(0);
            $table->decimal('total_expenses', 10, 2)->default(0);
            $table->string('status')->default('open'); // 'open', 'closed'
            $table->foreign('cashier_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('unit_id')->references('id')->on('unit')->onDelete('set null');
            $table->timestamps();
        });

        // Laporan table
        Schema::create('laporan', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('type'); // 'daily', 'weekly', 'monthly', 'custom'
            $table->timestamp('date_from')->nullable();
            $table->timestamp('date_to')->nullable();
            $table->json('data')->nullable(); // Store report data as JSON
            $table->string('unit_id')->nullable();
            $table->foreign('unit_id')->references('id')->on('unit')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan');
        Schema::dropIfExists('sessions_pos');
        Schema::dropIfExists('pengeluaran');
        Schema::dropIfExists('kas_masuk');
        Schema::dropIfExists('piutang');
        Schema::dropIfExists('transaksi_items');
        Schema::dropIfExists('transaksi');
        Schema::dropIfExists('produk');
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropColumn(['role', 'unit_id', 'status']);
        });
        Schema::dropIfExists('unit');
        Schema::dropIfExists('satuan');
        Schema::dropIfExists('kategori');
    }
};
