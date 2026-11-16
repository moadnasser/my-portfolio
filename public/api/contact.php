<?php
/**
 * Contact form endpoint for the portfolio. Accepts a JSON POST {name, email, message, company}
 * and mails it to the site owner.
 *
 * Delivery: if a config file exists, the message goes through that SMTP account (reliable, and the
 * only way it works on a machine with no mail server, such as local dev). Without one it falls back
 * to PHP's mail(), which cPanel hosts provide. The config is looked for next to this file
 * (contact.config.php) and one level above the web root (portfolio-contact.config.php); it holds a
 * password, so it is git-ignored and never part of the build. See contact.config.example.php in the repo root.
 *
 * - `company` is a honeypot: real visitors never see or fill it.
 * - Same-origin only: there are no CORS headers, so other sites cannot post here from a browser.
 * - One message per IP every 30 seconds, tracked in the system temp directory.
 */
declare(strict_types=1);

const RECIPIENT = 'moadnasseral@gmail.com';
const MIN_SECONDS_BETWEEN = 30;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method']);
}

$raw = file_get_contents('php://input', false, null, 0, 20000);
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'error' => 'body']);
}

// Bots fill every field. Answer as if it worked so they do not retry.
if (trim((string)($data['company'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}

/** Collapse to one line and drop control characters, so nothing can inject mail headers. */
function oneLine(string $value, int $max): string
{
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '';
    return mb_substr(trim($value), 0, $max);
}

$name = oneLine((string)($data['name'] ?? ''), 100);
$email = oneLine((string)($data['email'] ?? ''), 200);
$message = mb_substr(trim((string)($data['message'] ?? '')), 0, 5000);

if ($name === '' || mb_strlen($message) < 10 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, ['ok' => false, 'error' => 'invalid']);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$stamp = sys_get_temp_dir() . '/portfolio-contact-' . hash('sha256', $ip);
if (is_file($stamp) && time() - (int)filemtime($stamp) < MIN_SECONDS_BETWEEN) {
    respond(429, ['ok' => false, 'error' => 'rate']);
}
@touch($stamp);

$host = preg_replace('/[^a-z0-9.-]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
$subject = '=?UTF-8?B?' . base64_encode('Portfolio message from ' . $name) . '?=';
$body = "Name: {$name}\nEmail: {$email}\n\n{$message}\n";

/** SMTP settings from the first config file found, or null to use mail(). */
function smtpConfig(): ?array
{
    $candidates = [__DIR__ . '/contact.config.php'];
    $root = $_SERVER['DOCUMENT_ROOT'] ?? '';
    if ($root !== '') {
        $candidates[] = dirname(rtrim($root, '/')) . '/portfolio-contact.config.php';
    }
    foreach ($candidates as $file) {
        if (is_file($file)) {
            $cfg = require $file;
            if (is_array($cfg) && !empty($cfg['host']) && !empty($cfg['user']) && !empty($cfg['pass'])) {
                return $cfg;
            }
        }
    }
    return null;
}

/**
 * Minimal authenticated SMTP client (implicit TLS on 465, STARTTLS otherwise). Returns null on
 * success or a short reason on failure; the reason is logged, never sent to the browser.
 */
function smtpSend(array $cfg, string $to, string $replyTo, string $subject, string $body): ?string
{
    $port = (int)($cfg['port'] ?? 465);
    $secure = (string)($cfg['secure'] ?? ($port === 465 ? 'ssl' : ($port === 25 ? 'none' : 'tls')));
    $from = (string)($cfg['from'] ?? $cfg['user']);
    $socket = @stream_socket_client(($secure === 'ssl' ? 'ssl://' : 'tcp://') . $cfg['host'] . ':' . $port, $errno, $errstr, 12);
    if (!$socket) {
        return "connect: {$errstr}";
    }
    stream_set_timeout($socket, 12);

    $read = function () use ($socket): string {
        $out = '';
        while (($line = fgets($socket, 600)) !== false) {
            $out .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        return $out;
    };
    $cmd = function (string $line, int $expect) use ($socket, $read): ?string {
        fwrite($socket, $line . "\r\n");
        $reply = $read();
        return (int)substr($reply, 0, 3) === $expect ? null : trim($reply);
    };
    $ehlo = 'EHLO ' . (gethostname() ?: 'localhost');

    $steps = function () use ($cmd, $read, $socket, $secure, $ehlo, $cfg, $from, $to, $replyTo, $subject, $body): ?string {
        if ((int)substr($read(), 0, 3) !== 220) {
            return 'greeting';
        }
        if ($err = $cmd($ehlo, 250)) {
            return "ehlo: {$err}";
        }
        if ($secure === 'tls') {
            if ($err = $cmd('STARTTLS', 220)) {
                return "starttls: {$err}";
            }
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                return 'tls handshake';
            }
            if ($err = $cmd($ehlo, 250)) {
                return "ehlo: {$err}";
            }
        }
        if ($err = $cmd('AUTH LOGIN', 334)) {
            return "auth: {$err}";
        }
        if ($err = $cmd(base64_encode((string)$cfg['user']), 334)) {
            return "auth user: {$err}";
        }
        if ($err = $cmd(base64_encode((string)$cfg['pass']), 235)) {
            return "auth pass: {$err}";
        }
        if ($err = $cmd("MAIL FROM:<{$from}>", 250)) {
            return "from: {$err}";
        }
        if ($err = $cmd("RCPT TO:<{$to}>", 250)) {
            return "rcpt: {$err}";
        }
        if ($err = $cmd('DATA', 354)) {
            return "data: {$err}";
        }
        $domain = substr(strrchr($from, '@') ?: '@localhost', 1);
        $headers = [
            'Date: ' . date('r'),
            'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $domain . '>',
            "From: Portfolio <{$from}>",
            "To: <{$to}>",
            "Reply-To: <{$replyTo}>",
            "Subject: {$subject}",
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
        ];
        // Base64 keeps every line short and free of a leading dot, so no dot-stuffing is needed.
        $payload = implode("\r\n", $headers) . "\r\n\r\n" . rtrim(chunk_split(base64_encode($body), 76, "\r\n"));
        if ($err = $cmd($payload . "\r\n.", 250)) {
            return "send: {$err}";
        }
        $cmd('QUIT', 221);
        return null;
    };

    $result = $steps();
    fclose($socket);
    return $result;
}

$cfg = smtpConfig();
if ($cfg !== null) {
    $error = smtpSend($cfg, (string)($cfg['to'] ?? RECIPIENT), $email, $subject, $body);
    if ($error !== null) {
        error_log('portfolio contact: smtp failed: ' . $error);
    }
    $sent = $error === null;
} else {
    $headers = [
        'From: Portfolio <no-reply@' . $host . '>',
        'Reply-To: ' . $email,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];
    $sent = mail(RECIPIENT, $subject, $body, implode("\r\n", $headers));
}

if (!$sent) {
    // Let the visitor retry straight away after a failure on our side.
    @unlink($stamp);
}
respond($sent ? 200 : 502, ['ok' => $sent]);
