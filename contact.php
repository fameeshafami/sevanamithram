<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(bool $success, string $message, int $status = 200): never
{
    http_response_code($status);
    echo json_encode(
        ['success' => $success, 'message' => $message],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

// Hidden field catches simple automated submissions.
if (!empty($_POST['website'] ?? '')) {
    respond(true, 'Thank you. Your message has been received.');
}

$name = trim((string) ($_POST['name'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || $phone === '' || $email === '' || $subject === '' || $message === '') {
    respond(false, 'Please complete all required fields.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.', 422);
}

if (!preg_match('/^[0-9+\-\s()]{7,20}$/', $phone)) {
    respond(false, 'Please enter a valid phone number.', 422);
}

if (mb_strlen($name) > 100 || mb_strlen($subject) > 120 || mb_strlen($message) > 5000) {
    respond(false, 'One or more fields are too long.', 422);
}

// Strip line breaks from values used in email headers to prevent header injection.
$safeName = str_replace(["\r", "\n"], '', $name);
$safeEmail = str_replace(["\r", "\n"], '', $email);
$safeSubject = str_replace(["\r", "\n"], '', $subject);

$recipient = 'sevanamithramonline@gmail.com';
$mailSubject = 'Website enquiry: ' . $safeSubject;
$body = implode("\r\n", [
    'New enquiry from the SEVANAMITHRAM website',
    '',
    'Name: ' . $safeName,
    'Phone: ' . $phone,
    'Email: ' . $safeEmail,
    'Service: ' . $safeSubject,
    '',
    'Message:',
    $message,
]);

// Replace this address with an email account on the deployed domain if required by the host.
$domain = preg_replace('/^www\./', '', (string) ($_SERVER['HTTP_HOST'] ?? 'sevanamithram.in'));
$domain = preg_replace('/[^a-z0-9.-]/i', '', $domain) ?: 'sevanamithram.in';
$headers = [
    'From: SEVANAMITHRAM Website <noreply@' . $domain . '>',
    'Reply-To: ' . $safeName . ' <' . $safeEmail . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = mail($recipient, $mailSubject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(false, 'Your message could not be sent right now. Please call or WhatsApp us.', 500);
}

respond(true, 'Thank you! Your message has been sent. We will contact you shortly.');
