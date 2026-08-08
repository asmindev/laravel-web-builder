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

        // Method 1: Use PDO SQLite if extension is loaded
        if (extension_loaded('pdo_sqlite')) {
            try {
                return $this->convertUsingPDO($sqliteDbPath, $header);
            } catch (Exception $e) {
                // Fallthrough to Node helper if PDO fails
            }
        }

        // Method 2: Fallback to Node.js better-sqlite3 script
        try {
            return $this->convertUsingNodeHelper($sqliteDbPath, $header);
        } catch (Exception $e) {
            return $header . "-- Error converting SQLite database: " . $e->getMessage() . "\n";
        }
    }

    private function convertUsingPDO(string $sqliteDbPath, string $header): string
    {
        $pdo = new PDO("sqlite:{$sqliteDbPath}");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $dump = $header;
        $stmt = $pdo->query("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($tables)) {
            $dump .= "-- No user tables found in database.\n";
            return $dump;
        }

        foreach ($tables as $table) {
            $tableName = $table['name'];
            $sqliteSql = $table['sql'];

            $dump .= "\n-- --------------------------------------------------------\n";
            $dump .= "-- Table structure for table `{$tableName}`\n";
            $dump .= "-- --------------------------------------------------------\n\n";

            $dump .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $dump .= $this->translateCreateTableToMySQL($tableName, $sqliteSql) . ";\n\n";

            $dataStmt = $pdo->query("SELECT * FROM \"{$tableName}\"");
            $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($rows)) {
                $dump .= "-- Dumping data for table `{$tableName}`\n";
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

                    $dump .= "INSERT INTO `{$tableName}` ({$colList}) VALUES (" . implode(', ', $valList) . ");\n";
                }
                $dump .= "\n";
            }
        }

        $dump .= "SET FOREIGN_KEY_CHECKS=1;\n";
        return $dump;
    }

    private function convertUsingNodeHelper(string $sqliteDbPath, string $header): string
    {
        $nodeEngineDir = base_path('node-engine');
        $script = "
        const Database = require('better-sqlite3');
        const db = new Database(" . json_encode($sqliteDbPath) . ");
        const tables = db.prepare(\"SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'\").all();
        let dump = '';
        for (const t of tables) {
            dump += '\\n-- Table structure for table `' + t.name + '`\\n';
            dump += 'DROP TABLE IF EXISTS `' + t.name + '`;\\n';
            let sql = t.sql || '';
            sql = sql.replace(/\"([^\"]+)\"/g, '`$1`')
                     .replace(/AUTOINCREMENT/gi, 'AUTO_INCREMENT')
                     .replace(/INTEGER\\s+PRIMARY\\s+KEY\\s+AUTO_INCREMENT/gi, 'INT AUTO_INCREMENT PRIMARY KEY')
                     .replace(/INTEGER\\s+PRIMARY\\s+KEY/gi, 'INT AUTO_INCREMENT PRIMARY KEY')
                     .replace(/INTEGER/gi, 'INT')
                     .replace(/TEXT/gi, 'VARCHAR(255)')
                     .replace(/REAL|NUMERIC|DOUBLE/gi, 'DECIMAL(12,2)')
                     .replace(/DEFAULT\\s*\\(datetime\\('now'\\)\\)/gi, 'DEFAULT CURRENT_TIMESTAMP')
                     .replace(/datetime\\('now'\\)/gi, 'CURRENT_TIMESTAMP');
            if (!/ENGINE=/i.test(sql)) sql += ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';
            dump += sql + ';\\n\\n';

            const rows = db.prepare('SELECT * FROM \"' + t.name + '\"').all();
            if (rows.length > 0) {
                dump += '-- Dumping data for table `' + t.name + '`\\n';
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

            if (!empty(trim($output))) {
                return $header . $output . "\nSET FOREIGN_KEY_CHECKS=1;\n";
            }
        }

        return $header . "-- No tables or data exported.\nSET FOREIGN_KEY_CHECKS=1;\n";
    }

    private function translateCreateTableToMySQL(string $tableName, string $sqliteSql): string
    {
        if (empty($sqliteSql)) {
            return "CREATE TABLE `{$tableName}` (\n  `id` INT AUTO_INCREMENT PRIMARY KEY\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        }

        $sql = $sqliteSql;
        $sql = preg_replace('/"([^"]+)"/', '`$1`', $sql);
        $sql = preg_replace('/AUTOINCREMENT/i', 'AUTO_INCREMENT', $sql);
        $sql = preg_replace('/INTEGER\s+PRIMARY\s+KEY\s+AUTO_INCREMENT/i', 'INT AUTO_INCREMENT PRIMARY KEY', $sql);
        $sql = preg_replace('/INTEGER\s+PRIMARY\s+KEY/i', 'INT AUTO_INCREMENT PRIMARY KEY', $sql);
        $sql = preg_replace('/INTEGER/i', 'INT', $sql);
        $sql = preg_replace('/TEXT/i', 'VARCHAR(255)', $sql);
        $sql = preg_replace('/REAL|NUMERIC|DOUBLE/i', 'DECIMAL(12,2)', $sql);
        $sql = preg_replace('/DEFAULT\s*\(datetime\(\'now\'\)\)/i', 'DEFAULT CURRENT_TIMESTAMP', $sql);
        $sql = preg_replace('/DEFAULT\s*\(date\(\'now\'\)\)/i', 'DEFAULT CURRENT_DATE', $sql);
        $sql = preg_replace('/datetime\(\'now\'\)/i', 'CURRENT_TIMESTAMP', $sql);

        if (!preg_match('/ENGINE=/i', $sql)) {
            $sql .= " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        }

        return $sql;
    }

    private function generateDefaultHeader(): string
    {
        return "-- --------------------------------------------------------\n" .
               "-- MySQL Database Dump\n" .
               "-- Generated by Nusantara Engine (https://engine.nusantaratech.id)\n" .
               "-- Date: " . date('Y-m-d H:i:s') . "\n" .
               "-- --------------------------------------------------------\n\n" .
               "SET FOREIGN_KEY_CHECKS=0;\n";
    }
}
