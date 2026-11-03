<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Show the report list page.
     */
    public function index(): Response
    {
        return Inertia::render('reports/index');
    }
}
