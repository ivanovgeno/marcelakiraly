<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, 'Tento způsob odeslání není podporován.');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, [
    'https://konstelacesmarcelou.cz',
    'https://www.konstelacesmarcelou.cz',
], true)) {
    respond(403, 'Zprávu se nepodařilo odeslat.');
}

if (isset($_SERVER['CONTENT_LENGTH']) && (int) $_SERVER['CONTENT_LENGTH'] > 12000) {
    respond(413, 'Zpráva je příliš dlouhá.');
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
$service = (string) ($_POST['service'] ?? '');
$services = [
    'Individuální konstelace osobně',
    'Individuální konstelace online',
    'Nejsem si jistý/á',
];

if ($name === '' || strlen($name) > 160 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254 ||
    strlen($message) < 5 || strlen($message) > 6000 ||
    !in_array($service, $services, true) ||
    preg_match('/[\r\n\x00-\x1F\x7F]/', $name . $email)) {
    respond(422, 'Zkontrolujte prosím jméno, e-mail a zprávu.');
}

session_start();
if (isset($_SESSION['contact_last_sent']) && time() - (int) $_SESSION['contact_last_sent'] < 30) {
    respond(429, 'Počkejte prosím chvíli před odesláním další zprávy.');
}

$sender = 'formular@konstelacesmarcelou.cz';
$recipient = 'mk@konstelacesmarcelou.cz';
$subject = '=?UTF-8?B?' . base64_encode('Nová zpráva z webu Konstelace s Marcelou') . '?=';
$body = implode("\n", [
    'Nová zpráva z kontaktního formuláře',
    '',
    'Jméno: ' . $name,
    'E-mail: ' . $email,
    'Služba: ' . $service,
    'Marketingový souhlas: ' . (($_POST['marketing_consent'] ?? '') === 'yes' ? 'ano' : 'ne'),
    '',
    'Zpráva:',
    $message,
]);
$headers = [
    'From' => 'Konstelace s Marcelou <' . $sender . '>',
    'Reply-To' => $email,
    'Content-Type' => 'text/plain; charset=UTF-8',
    'MIME-Version' => '1.0',
];

try {
    $accepted = mail($recipient, $subject, $body, $headers, '-f ' . $sender);
} catch (Throwable $error) {
    $accepted = false;
}

if (!$accepted) {
    respond(503, 'Zprávu se nepodařilo odeslat. Napište prosím přímo na mk@konstelacesmarcelou.cz.');
}

$_SESSION['contact_last_sent'] = time();
respond(200, 'Děkuji, vaše zpráva byla odeslána. Ozvu se vám co nejdříve.');
