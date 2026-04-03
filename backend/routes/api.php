<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\SatuanController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\PiutangController;
use App\Http\Controllers\KasMasukController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\SessionPosController;
use App\Http\Controllers\LaporanController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// POS API Routes
Route::apiResource('kategori', KategoriController::class);
Route::apiResource('satuan', SatuanController::class);
Route::apiResource('unit', UnitController::class);
Route::apiResource('produk', ProdukController::class);
Route::apiResource('transaksi', TransaksiController::class);
Route::apiResource('piutang', PiutangController::class);
Route::apiResource('kas-masuk', KasMasukController::class);
Route::apiResource('pengeluaran', PengeluaranController::class);
Route::apiResource('sessions', SessionPosController::class);
Route::apiResource('laporan', LaporanController::class);
