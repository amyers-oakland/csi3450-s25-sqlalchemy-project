<?php
use App\Controllers\StudentController;

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");

function dump_json($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
}

function get_path(): string {
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($uri, PHP_URL_PATH);

    // stripping /project from the path
    // should be /index.php anyway since I changed the document root to /project/public
    $scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/');
    if ($scriptDir !== '' && strncmp($path, $scriptDir, strlen($scriptDir)) === 0) {
        $path = substr($path, strlen($scriptDir));
    }

    return $path ?: '/';
}

function get_method(): string {
    return $_SERVER['REQUEST_METHOD'] ?? 'GET';
}

$routes = [];

function route(string $method, string $pattern, array $handler): void {
    global $routes;

    $varNames = [];
    $regex = preg_replace_callback('/\{([a-zA-Z_][a-zA-Z0-9_]*)(?::(int|slug|any))?\}/', function($m) use (&$varNames) {
        $varNames[] = $m[1];
        $type = $m[2] ?? 'any';
        return match($type) {
            'int' => '(\d+)',
            'slug' => '([A-Za-z0-9_-]+)',
            'any' => '([^/]+)',
            default => '([^/]+)',
        };
    }, $pattern);

    // Allow optional trailing slash for all routes
    $regex = '#^' . rtrim($regex, '/') . '/?$#';
    $routes[$method][] = ['regex' => $regex, 'vars' => $varNames, 'handler' => $handler];
}


function dispatch(): void {
    global $routes;
    $path = get_path();
    $method = get_method();
  
    foreach ($routes[$method] ?? [] as $r) {
      if (preg_match($r['regex'], $path, $m)) {
        array_shift($m); // remove full match
        $args = $m;      // numeric params in order
  
        [$class, $func] = $r['handler'];
        $controller = new $class();
        call_user_func_array([$controller, $func], $args);
        return;
      }
    }
  
    // Method exists for another verb?
    foreach ($routes as $verb => $list) {
      if ($verb === $method) continue;
      foreach ($list as $r) {
        if (preg_match($r['regex'], $path)) {
          dump_json(['error' => 'Method Not Allowed'], 405);
          error_log("PATH: $path");
          return;
        }
      }
    }

    dump_json(['error' => 'Not Found'], 404);
}

route('GET', '/api/students', [StudentController::class, 'index']);
route('GET', '/api/students/{id:int}', [StudentController::class, 'showById']);
route('GET', '/api/students/search/{name}', [StudentController::class, 'showByName']);
route('POST', '/api/students', [StudentController::class, 'store']);
route('PUT', '/api/students/{id:int}', [StudentController::class, 'update']);
route('DELETE', '/api/students/{id:int}', [StudentController::class, 'destroy']);