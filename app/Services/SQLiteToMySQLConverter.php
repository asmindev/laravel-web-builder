<?php

namespace App\Services;

use PDO;
use Exception;

class SQLiteToMySQLConverter
{
    /**
     * Convert an SQLite database file into a MySQL compatible SQL dump string.
     *
     * @param string $sqliteDbPath Absolute path to the .db SQLite file
     * @return string Valid MySQL dump string
     */
    public function convertToMySQLDump(string $sqliteDbPath): string
    {
        $header = $this->generateDefaultHeader();

        if (!file_exists($sqliteDbPath)) {
            return $header . "-- No SQLite database found for this project.\n";
        }

        // Method 1: Use `sqlite3` CLI binary if available
        $dumpRaw = $this->dumpViaSqlite3Cli($sqliteDbPath);

        // Method 2: Use PDO SQLite if CLI unavailable/empty
        if (empty($dumpRaw) && extension_loaded('pdo_sqlite')) {
            $dumpRaw = $this->dumpViaPDO($sqliteDbPath);
        }

        // Method 3: Fallback to Node.js better-sqlite3
        if (empty($dumpRaw)) {
            $dumpRaw = $this->dumpViaNode($sqliteDbPath);
        }

        if (empty(trim($dumpRaw))) {
            return $header . "-- No tables or data found in database.\nSET FOREIGN_KEY_CHECKS=1;\n";
        }

        // Translate SQLite dump string to MySQL compatible dump
        return $header . $this->translateSqliteDumpToMySQL($dumpRaw) . "\nSET FOREIGN_KEY_CHECKS=1;\n";
    }

    private function dumpViaSqlite3Cli(string $sqliteDbPath): string
    {
        $cmd = "sqlite3 " . escapeshellarg($sqliteDbPath) . " .dump";
        $descriptors = [
            0 => ["pipe", "r"],
            1 => ["pipe", "w"],
            2 => ["pipe", "w"]
        ];

        $process = proc_open($cmd, $descriptors, $pipes);
        if (is_resource($process)) {
            $output = stream_get_contents($pipes[1]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            proc_close($process);

            if (!empty($output)) {
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
                $output .= $sqliteSql . ";\n\n";

                $dataStmt = $pdo->query("SELECT * FROM \"{$tableName}\"");
                $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

                if (!empty($rows)) {
                    $columns = array_keys($rows[0]);
                    $colList = implode(', ', array_map(fn($c) => "`{$c}`", $columns));

                    foreach ($rows as $row) {
                        $valList = [];
                        foreach ($row as $val) {
                            if ($val === null) {
                                $valList[] = 'NULL';
                            } elseif (is_int($val) || is_float($val)) {
                                $valList[] = $val;
                            } else {
                                $escaped = str_replace(["\\", "'"], ["\\\\", "''"], (string)$val);
                                $valList[] = "'{$escaped}'";
                            }
                        }
                        $output .= "INSERT INTO `{$tableName}` ({$colList}) VALUES (" . implode(', ', $valList) . ");\n";
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
        const Database = require('better-sqlite3');
        const db = new Database(" . json_encode($sqliteDbPath) . ");
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
        ";

        $cmd = "node -e " . escapeshellarg($script);
        $descriptors = [
            0 => ["pipe", "r"],
            1 => ["pipe", "w"],
            2 => ["pipe", "w"]
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
     * Translates raw SQLite dump syntax to MySQL syntax
     */
    private function translateSqliteDumpToMySQL(string $dump): string
    {
        $lines = explode("\n", $dump);
        $outLines = [];

        foreach ($lines as $line) {
            // Ignore PRAGMA, sqlite_sequence, and internal sqlite statements
            if (preg_match('/^PRAGMA\s+/i', $line)) continue;
            if (preg_match('/sqlite_sequence/i', $line)) continue;

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
                $line = ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            }

            $outLines[] = $line;
        }

        return implode("\n", $outLines);
    }

    private function generateDefaultHeader(): string
    {
        return "-- --------------------------------------------------------\n" .
               "-- MySQL Database Dump\n" .
               "-- Generated by Nusantara Engine (https://nusantaratech.id)\n" .
               "-- Date: " . date('Y-m-d H:i:s') . "\n" .
               "-- --------------------------------------------------------\n\n" .
               "SET FOREIGN_KEY_CHECKS=0;\n";
    }
}
