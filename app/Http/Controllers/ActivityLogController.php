<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Show the activity history page.
     */
    public function index(): Response
    {
        return Inertia::render('activity/index');
    }
}
