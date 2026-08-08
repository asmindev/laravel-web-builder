<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Spatie Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Create Default Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@nusantaratech.id'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password'),
                'plan' => 'business',
            ]
        );
        $admin->assignRole($adminRole);

        // Create Demo Normal User
        $demoUser = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'password' => bcrypt('password'),
                'plan' => 'starter',
            ]
        );
        $demoUser->assignRole($userRole);

        // Ensure all existing users have at least 'user' role
        User::all()->each(function ($u) use ($userRole, $admin) {
            if ($u->id !== $admin->id && !$u->hasAnyRole(['admin', 'user'])) {
                $u->assignRole($userRole);
            }
        });

        $this->call([
            ProjectSeeder::class,
            SimpleAppSeeder::class,
            MySQLAppSeeder::class,
        ]);
    }
}
