<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ReportMapController extends Controller
{
    /**
     * Show the report map page.
     */
    public function index(): Response
    {
        return Inertia::render('reports/map');
    }
}
