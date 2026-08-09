<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Untuk eksplorasi kekuatan AI.',
                'price' => 0,
                'price_period' => '/bln',
                'project_limit' => 2,
                'features' => [
                    '10x Generate AI per bulan',
                    'Akses Editor Visual Dasar',
                    'Domain nusantartech.site',
                ],
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Untuk kebutuhan proyek skala kecil.',
                'price' => 49000,
                'price_period' => '/bln',
                'project_limit' => 5,
                'features' => [
                    '50x Generate AI per bulan',
                    'Akses Full Editor',
                    'Standard Support',
                ],
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 2,
            ],
            [
                'name' => 'Pro Builder',
                'slug' => 'pro',
                'description' => 'Solusi lengkap untuk profesional.',
                'price' => 149000,
                'price_period' => '/bln',
                'project_limit' => 10,
                'features' => [
                    'Unlimited Generate AI',
                    'Export Kode (HTML/React/Tailwind)',
                    'Custom Domain (.com/.id)',
                    'Integrasi Database',
                ],
                'is_active' => true,
                'is_popular' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Business',
                'slug' => 'business',
                'description' => 'Untuk agensi dan tim skala besar.',
                'price' => 299000,
                'price_period' => '/bln',
                'project_limit' => 15,
                'features' => [
                    'Unlimited Generate AI',
                    'Prioritas Server',
                    'Dedicated Admin Support',
                    'Integrasi DB & Export Full',
                ],
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $planData) {
            \App\Models\Plan::updateOrCreate(
                ['slug' => $planData['slug']],
                $planData
            );
        }
    }
}
