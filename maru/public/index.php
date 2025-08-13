<?php
declare(strict_types=1);

spl_autoload_register(function ($class) {
    $prefixes = [
        'App\\Config\\' => __DIR__ . '/../config/',
        'App\\' => __DIR__ . '/../app/',
    ];

    foreach ($prefixes as $prefix => $baseDir) {
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) === 0) {
            $relative = substr($class, $len);
            $file = $baseDir . str_replace('\\', '/', $relative) . '.php';
            if (file_exists($file)) {
                require $file;
                return;
            }
        }
    }
});

require __DIR__ . '/../app/routes/api.php';

dispatch();


