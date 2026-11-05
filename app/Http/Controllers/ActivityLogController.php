<?php

namespace App\Http\Controllers;

use App\Services\ActivityFeedService;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Show the activity history page.
     */
    public function index(ActivityFeedService $activityFeed): Response
    {
        return Inertia::render('activity/index', [
            'activities' => $activityFeed->latest(),
        ]);
    }
}
