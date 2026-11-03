<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard')
            ->has('stats')
            ->has('recentReports')
            ->has('statusSummary')
            ->has('poller')
        );
});

test('authenticated users can fetch poller logs endpoint', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('poller.logs'));
    $response->assertOk()
        ->assertJsonStructure(['is_running', 'pid', 'logs']);
});
