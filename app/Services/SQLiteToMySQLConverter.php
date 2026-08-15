<?php

namespace App\Services;

use App\Models\Project;
use Exception;
use PDO;

class SQLiteToMySQLConverter
{
    /**
     * Convert an SQLite database file into a MySQL compatible SQL dump string.
     *
     * @param  string  $sqliteDbPath  Absolute path to the .db SQLite file
     * @param  Project|null  $project  Optional project model to auto-initialize DB if missing
     * @return string Valid MySQL dump string
     */
    public function convertToMySQLDump(string $sqliteDbPath, ?Project $project = null): string
    {
        $header = $this->generateDefaultHeader();

        // 1. Auto-initialize database if it does not exist yet on disk
        if ((! file_exists($sqliteDbPath) || filesize($sqliteDbPath) === 0) && $project) {
            $this->ensureDatabaseInitialized($project, $sqliteDbPath);
        }

        if (! file_exists($sqliteDbPath)) {
            // Fallback: Try extracting table definitions directly from app.js if DB cannot be created
            $fallbackDump = $project ? $this->extractSchemaFromAppJs($project) : '';
            if (! empty($fallbackDump)) {
                return $header.$this->translateSqliteDumpToMySQL($fallbackDump)."\nSET FOREIGN_KEY_CHECKS=1;\n";
            }

            return $header."-- No SQLite database found for this project.\nSET FOREIGN_KEY_CHECKS=1;\n";
        }

        // Method 1: Use `sqlite3` CLI binary if available
        $dumpRaw = $this->dumpViaSqlite3Cli($sqliteDbPath);

        // Method 2: Use PDO SQLite if CLI unavailable/empty
        if (empty(trim($dumpRaw)) && extension_loaded('pdo_sqlite')) {
            $dumpRaw = $this->dumpViaPDO($sqliteDbPath);
        }

        // Method 3: Fallback to Node.js (node:sqlite / better-sqlite3)
        if (empty(trim($dumpRaw))) {
            $dumpRaw = $this->dumpViaNode($sqliteDbPath);
        }

        // Method 4: Fallback to static code extraction from app.js
        if (empty(trim($dumpRaw)) && $project) {
            $dumpRaw = $this->extractSchemaFromAppJs($project);
        }

        if (empty(trim($dumpRaw))) {
            return $header."-- No tables or data found in database.\nSET FOREIGN_KEY_CHECKS=1;\n";
        }

        // Translate SQLite dump string to MySQL compatible dump
        return $header.$this->translateSqliteDumpToMySQL($dumpRaw)."\nSET FOREIGN_KEY_CHECKS=1;\n";
    }

    /**
     * Auto-initialize the project database by executing its app.js in node-engine
     */
    private function ensureDatabaseInitialized(Project $project, string $sqliteDbPath): void
    {
        try {
            $project->loadMissing(['files', 'assets']);
            $nodeEngineDir = base_path('node-engine');
            $projectData = [
                'slug' => $project->slug,
                'published' => true,
                'files' => $project->files->map(fn ($f) => [
                    'path' => $f->path,
                    'content' => $f->content,
                    'updated_at' => $f->updated_at?->toIso8601String(),
                ])->toArray(),
            ];

            $script = "
            const fs = require('fs');
            const { RenderService } = require('./src/services/render');
            const render = new RenderService();

            let rawInput = '';
            process.stdin.setEncoding('utf-8');
            process.stdin.on('data', chunk => rawInput += chunk);
            process.stdin.on('end', async () => {
                try {
                    const parsed = JSON.parse(rawInput);
                    const mockReq = { url: '/', method: 'GET', headers: {} };
                    const mockRes = { on: () => {}, off: () => {}, setHeader: () => {}, send: () => {}, end: () => {} };
                    await render.tryExpressApp(parsed.slug, mockReq, mockRes, parsed);
                } catch (e) {
                    console.error(e);
                }
            });
            ";

            $cmd = 'node -e '.escapeshellarg($script);
            $descriptors = [
                0 => ['pipe', 'r'],
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w'],
            ];

            $process = proc_open($cmd, $descriptors, $pipes, $nodeEngineDir);
            if (is_resource($process)) {
                fwrite($pipes[0], json_encode($projectData));
                fclose($pipes[0]);
                stream_get_contents($pipes[1]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                proc_close($process);
            }
        } catch (\Throwable $e) {
            // Silently continue to fallbacks if auto-init fails
        }
    }

    private function dumpViaSqlite3Cli(string $sqliteDbPath): string
    {
        $escaped = escapeshellarg($sqliteDbPath);
        // 1. Checkpoint WAL to main db file
        @exec("sqlite3 {$escaped} \"PRAGMA wal_checkpoint(TRUNCATE);\" 2>/dev/null");

        // 2. Perform clean SQLite dump
        $cmd = "sqlite3 {$escaped} .dump";
        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $process = proc_open($cmd, $descriptors, $pipes);
        if (is_resource($process)) {
            $output = stream_get_contents($pipes[1]);
            fclose($pipes[0]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            proc_close($process);

            if (! empty(trim($output)) && (str_contains($output, 'CREATE TABLE') || str_contains($output, 'INSERT INTO'))) {
                return $output;
            }
        }

        return '';
    }

    private function dumpViaPDO(string $sqliteDbPath): string
    {
        try {
            $pdo = new PDO("sqlite:{$sqliteDbPath}");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->exec('PRAGMA wal_checkpoint(TRUNCATE);');

            $stmt = $pdo->query("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($tables)) {
                return '';
            }

            $output = '';
            foreach ($tables as $table) {
                $tableName = $table['name'];
                $sqliteSql = $table['sql'];

                $output .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
                $output .= $sqliteSql.";\n\n";

                $dataStmt = $pdo->query("SELECT * FROM \"{$tableName}\"");
                $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

                if (! empty($rows)) {
                    $columns = array_keys($rows[0]);
                    $colList = implode(', ', array_map(fn ($c) => "`{$c}`", $columns));

                    foreach ($rows as $row) {
                        $valList = [];
                        foreach ($row as $val) {
                            if ($val === null) {
                                $valList[] = 'NULL';
                            } elseif (is_int($val) || is_float($val)) {
                                $valList[] = $val;
                            } else {
                                $escaped = str_replace(['\\', "'"], ['\\\\', "''"], (string) $val);
                                $valList[] = "'{$escaped}'";
                            }
                        }
                        $output .= "INSERT INTO `{$tableName}` ({$colList}) VALUES (".implode(', ', $valList).");\n";
                    }
                    $output .= "\n";
                }
            }

            return $output;
        } catch (Exception $e) {
            return '';
        }
    }

    private function dumpViaNode(string $sqliteDbPath): string
    {
        $nodeEngineDir = base_path('node-engine');
        $script = "
        let Database;
        try {
            const { DatabaseSync } = require('node:sqlite');
            if (DatabaseSync) Database = DatabaseSync;
        } catch {}
        if (!Database) {
            try { Database = require('better-sqlite3'); } catch {}
        }
        if (!Database) process.exit(0);

        try {
            const db = new Database(".json_encode($sqliteDbPath).");
            try {
                if (typeof db.exec === 'function') db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
                else if (typeof db.pragma === 'function') db.pragma('wal_checkpoint(TRUNCATE)');
            } catch {}

            const tables = db.prepare(\"SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'\").all();
            let dump = '';
            for (const t of tables) {
                dump += 'DROP TABLE IF EXISTS `' + t.name + '`;\\n';
                dump += t.sql + ';\\n\\n';
                const rows = db.prepare('SELECT * FROM \"' + t.name + '\"').all();
                if (rows.length > 0) {
                    const cols = Object.keys(rows[0]).map(c => '`' + c + '`').join(', ');
                    for (const r of rows) {
                        const vals = Object.values(r).map(v => {
                            if (v === null) return 'NULL';
                            if (typeof v === 'number') return v;
                            return \"'\" + String(v).replace(/\\\\/g, '\\\\\\\\').replace(/'/g, \"''\") + \"'\";
                        }).join(', ');
                        dump += 'INSERT INTO `' + t.name + '` (' + cols + ') VALUES (' + vals + ');\\n';
                    }
                    dump += '\\n';
                }
            }
            console.log(dump);
        } catch (e) {
            process.exit(0);
        }
        ";

        $cmd = 'node -e '.escapeshellarg($script);
        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $process = proc_open($cmd, $descriptors, $pipes, $nodeEngineDir);
        if (is_resource($process)) {
            $output = stream_get_contents($pipes[1]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            proc_close($process);

            return $output ?: '';
        }

        return '';
    }

    /**
     * Extract table definitions and seed inserts directly from app.js source code
     */
    private function extractSchemaFromAppJs(Project $project): string
    {
        $project->loadMissing('files');
        $appFile = $project->files->firstWhere('path', 'app.js') ?? $project->files->firstWhere('path', 'script.js');
        if (! $appFile || empty($appFile->content)) {
            return '';
        }

        $code = $appFile->content;
        $dump = '';

        // Match CREATE TABLE statements inside backticks or quotes
        if (preg_match_all('/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+[`"\'\w]+\s*\([^;]+?\);/is', $code, $matches)) {
            foreach ($matches[0] as $createStatement) {
                $dump .= $createStatement."\n\n";
            }
        }

        // Match INSERT INTO statements
        if (preg_match_all('/INSERT\s+INTO\s+[`"\'\w]+\s*(\([^)]+\))?\s*VALUES\s*\([^;]+?\);/is', $code, $insertMatches)) {
            foreach ($insertMatches[0] as $insertStatement) {
                $dump .= $insertStatement."\n";
            }
        }

        return $dump;
    }

    /**
     * Translates raw SQLite dump syntax to MySQL syntax
     */
    private function translateSqliteDumpToMySQL(string $dump): string
    {
        $lines = explode("\n", $dump);
        $outLines = [];

        foreach ($lines as $line) {
            // Ignore PRAGMA, sqlite_sequence, and internal sqlite statements
            if (preg_match('/^PRAGMA\s+/i', $line)) {
                continue;
            }
            if (preg_match('/sqlite_sequence/i', $line)) {
                continue;
            }

            // Translate transactions
            if (preg_match('/^BEGIN\s+TRANSACTION;/i', $line)) {
                $outLines[] = 'START TRANSACTION;';

                continue;
            }

            // Translate column types & AUTOINCREMENT in CREATE TABLE lines
            $line = preg_replace('/"([^"]+)"/', '`$1`', $line);
            $line = preg_replace('/AUTOINCREMENT/i', 'AUTO_INCREMENT', $line);
            $line = preg_replace('/INTEGER\s+PRIMARY\s+KEY\s+AUTO_INCREMENT/i', 'INT AUTO_INCREMENT PRIMARY KEY', $line);
            $line = preg_replace('/INTEGER\s+PRIMARY\s+KEY/i', 'INT AUTO_INCREMENT PRIMARY KEY', $line);
            $line = preg_replace('/INTEGER/i', 'INT', $line);
            $line = preg_replace('/TEXT/i', 'VARCHAR(255)', $line);
            $line = preg_replace('/REAL|NUMERIC|DOUBLE/i', 'DECIMAL(12,2)', $line);
            $line = preg_replace('/DEFAULT\s*\(datetime\(\'now\'\)\)/i', 'DEFAULT CURRENT_TIMESTAMP', $line);
            $line = preg_replace('/DEFAULT\s*\(date\(\'now\'\)\)/i', 'DEFAULT CURRENT_DATE', $line);
            $line = preg_replace('/datetime\(\'now\'\)/i', 'CURRENT_TIMESTAMP', $line);

            // Add ENGINE=InnoDB to CREATE TABLE closing parentheses if missing
            if (preg_match('/^\)\s*;/i', trim($line))) {
                $line = ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
            }

            $outLines[] = $line;
        }

        return implode("\n", $outLines);
    }

    private function generateDefaultHeader(): string
    {
        return "-- --------------------------------------------------------\n".
               "-- MySQL Database Dump\n".
               "-- Generated by Nusantara Engine (https://nusantaratech.id)\n".
               '-- Date: '.date('Y-m-d H:i:s')."\n".
               "-- --------------------------------------------------------\n\n".
               "SET FOREIGN_KEY_CHECKS=0;\n";
    }
}
