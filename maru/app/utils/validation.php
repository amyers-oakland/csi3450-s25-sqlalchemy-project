<?php
declare(strict_types=1);

namespace App\Utils;

class Validation {
    
    public static function isValidDate(string $date) : bool {
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
}