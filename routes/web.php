<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportMapController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('laporan', [ReportController::class, 'index'])->name('reports.index');
    Route::get('laporan/{report}', [ReportController::class, 'show'])->name('reports.show');
    Route::patch('laporan/{report}/status', [ReportController::class, 'updateStatus'])->name('reports.update-status');
    Route::get('peta', [ReportMapController::class, 'index'])->name('reports.map');
    Route::get('riwayat', [ActivityLogController::class, 'index'])->name('activity.index');
});

require __DIR__.'/settings.php';
