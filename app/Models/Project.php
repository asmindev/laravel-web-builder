<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Project extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'template',
        'config',
        'published',
        'published_at',
        'is_suspended',
        'suspension_reason',
        'suspended_at',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'published' => 'boolean',
            'published_at' => 'datetime',
            'is_suspended' => 'boolean',
            'suspended_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            if (!$project->slug) {
                $baseSlug = 'user-' . $project->user_id . '-project';
                $count = static::where('user_id', $project->user_id)->count() + 1;
                $slug = $baseSlug . '-' . $count;
                
                while (static::where('slug', $slug)->exists()) {
                    $count++;
                    $slug = $baseSlug . '-' . $count;
                }
                
                $project->slug = $slug;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(ProjectFile::class);
    }

    public function folders(): HasMany
    {
        return $this->hasMany(ProjectFolder::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(ProjectAsset::class);
    }

    public function publishes(): HasMany
    {
        return $this->hasMany(ProjectPublish::class);
    }

    public function scopePublished($query)
    {
        return $query->where('published', true);
    }
}
