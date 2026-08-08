<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Spatie Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Create Permissions
        $permissions = [
            'manage-users',
            'create-projects',
            'edit-projects',
            'delete-projects',
            'export-projects',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName]);
        }

        // Give all permissions to Admin role
        $adminRole->syncPermissions(Permission::all());

        // Give project permissions to User role
        $userRole->syncPermissions([
            'create-projects',
            'edit-projects',
            'delete-projects',
            'export-projects',
        ]);

        // Create Default Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@nusantaratech.id'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password'),
                'plan' => 'business',
            ]
        );
        $admin->syncRoles([$adminRole]);

        // Create Demo Normal User
        $demoUser = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'password' => bcrypt('password'),
                'plan' => 'starter',
            ]
        );
        $demoUser->syncRoles([$userRole]);

        // Ensure all existing users have at least 'user' role
        User::all()->each(function ($u) use ($userRole, $admin) {
            if ($u->id !== $admin->id && !$u->hasAnyRole(['admin', 'user'])) {
                $u->syncRoles([$userRole]);
            }
        });

        $this->call([
            ProjectSeeder::class,
            SimpleAppSeeder::class,
            MySQLAppSeeder::class,
        ]);
    }
}
