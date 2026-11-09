<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReportMapController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('poller/start', [DashboardController::class, 'startPoller'])->name('poller.start');
    Route::post('poller/stop', [DashboardController::class, 'stopPoller'])->name('poller.stop');
    Route::get('poller/logs', [DashboardController::class, 'getLogs'])->name('poller.logs');
    Route::delete('poller/logs', [DashboardController::class, 'clearLogs'])->name('poller.logs.clear');

    Route::get('laporan', [ReportController::class, 'index'])->name('reports.index');
    Route::get('laporan/{report}', [ReportController::class, 'show'])->name('reports.show');
    Route::patch('laporan/{report}/status', [ReportController::class, 'updateStatus'])->name('reports.update-status');
    Route::get('peta', [ReportMapController::class, 'index'])->name('reports.map');
    Route::get('riwayat', [ActivityLogController::class, 'index'])->name('activity.index');
});

require __DIR__.'/settings.php';
