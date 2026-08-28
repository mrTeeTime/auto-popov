<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Nepovolená metoda požadavku.'], JSON_UNESCAPED_UNICODE);
    exit;
}

function clean(string $value): string {
    return trim(strip_tags($value));
}

$name = clean($_POST['name'] ?? '');
$phone = clean($_POST['phone'] ?? '');
$email = clean($_POST['email'] ?? '');
$message = clean($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Prosím doplňte všechna povinná pole.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Zadejte prosím platnou e-mailovou adresu.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// TODO: před nasazením doplňte cílovou adresu, na kterou mají chodit zprávy z formuláře.
$recipient = '';

if ($recipient === '') {
    http_response_code(503);
    echo json_encode([
        'ok' => false,
        'message' => 'Formulář je připraven, ale cílová e-mailová adresa zatím není nastavena v php/send-mail.php.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$subject = 'AUTO-POPOV.cz – nový kontakt z webu';
$body = "Jméno: {$name}\n";
$body .= "Telefon: " . ($phone !== '' ? $phone : 'neuveden') . "\n";
$body .= "E-mail: {$email}\n\n";
$body .= "Co potřebuje zařídit:\n{$message}\n";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: AUTO-POPOV.cz <noreply@auto-popov.cz>',
    'Reply-To: ' . $email,
];

$sent = mail($recipient, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Zprávu se nepodařilo odeslat.'], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => true, 'message' => 'Formulář odeslán. Ozveme se vám co nejdříve.'], JSON_UNESCAPED_UNICODE);
