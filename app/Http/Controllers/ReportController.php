<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Show the report list page.
     */
    public function index(): Response
    {
        $reports = Report::with(['reporter'])
            ->latest()
            ->paginate(15);

        return Inertia::render('reports/index', [
            'reports' => $reports,
        ]);
    }
}
