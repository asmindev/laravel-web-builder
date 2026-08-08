<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'plan',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get maximum project upload limit based on plan or admin role
     */
    public function getProjectLimitAttribute(): int
    {
        if ($this->hasRole('admin')) {
            return 999999;
        }

        return match ($this->plan) {
            'starter' => 2,
            'basic' => 5,
            'pro' => 10,
            'business' => 15,
            default => 2,
        };
    }

    /**
     * Check if user can create a new project based on upload limits
     */
    public function canCreateProject(): bool
    {
        if ($this->hasRole('admin')) {
            return true;
        }

        return $this->projects()->count() < $this->project_limit;
    }

    /**
     * Formatted plan label
     */
    public function getPlanNameAttribute(): string
    {
        return ucfirst($this->plan ?? 'starter');
    }
}
