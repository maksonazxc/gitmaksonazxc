<?php
/**
 * Простий скрипт для відправки email повідомлень про реєстрацію
 * Використовує PHP mail() функцію
 */

// Налаштування
$admin_email = "svynoriz56@gmail.com";
$site_name = "Git Hub - Навчальний портал";

// Перевіряємо метод запиту
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Отримуємо дані з POST запиту
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Валідація даних
$required_fields = ['name', 'email', 'registeredAt'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Field '$field' is required"]);
        exit;
    }
}

// Підготовка даних
$user_name = htmlspecialchars($input['name']);
$user_email = htmlspecialchars($input['email']);
$user_message = htmlspecialchars($input['msg'] ?? 'Не вказано');
$registration_date = date('d.m.Y H:i:s', strtotime($input['registeredAt']));

// Формування email
$subject = "🎯 Нова реєстрація на $site_name";

$email_body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0d6efd; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; }
        .footer { background: #6c757d; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
        .label { font-weight: bold; color: #0d6efd; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>🎯 Нова реєстрація користувача</h2>
        </div>
        
        <div class='content'>
            <p>На вашому навчальному порталі зареєструвався новий користувач:</p>
            
            <div class='info-row'>
                <span class='label'>👤 Ім'я:</span> $user_name
            </div>
            
            <div class='info-row'>
                <span class='label'>📧 Email:</span> $user_email
            </div>
            
            <div class='info-row'>
                <span class='label'>💬 Повідомлення:</span> $user_message
            </div>
            
            <div class='info-row'>
                <span class='label'>📅 Дата реєстрації:</span> $registration_date
            </div>
            
            <div class='info-row'>
                <span class='label'>🌐 IP адреса:</span> " . $_SERVER['REMOTE_ADDR'] . "
            </div>
        </div>
        
        <div class='footer'>
            <p>Автоматичне повідомлення з $site_name</p>
        </div>
    </div>
</body>
</html>
";

// Заголовки для HTML email
$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: ' . $site_name . ' <noreply@gitportal.local>',
    'Reply-To: ' . $user_email,
    'X-Mailer: PHP/' . phpversion()
];

// Відправка email
try {
    $mail_sent = mail($admin_email, $subject, $email_body, implode("\r\n", $headers));
    
    if ($mail_sent) {
        // Логування успішної відправки
        $log_entry = date('Y-m-d H:i:s') . " - Email sent for user: $user_name ($user_email)\n";
        file_put_contents('email_log.txt', $log_entry, FILE_APPEND | LOCK_EX);
        
        echo json_encode([
            'success' => true,
            'message' => 'Email notification sent successfully'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
    
} catch (Exception $e) {
    // Логування помилки
    $error_entry = date('Y-m-d H:i:s') . " - Email error for user: $user_name ($user_email) - " . $e->getMessage() . "\n";
    file_put_contents('email_errors.txt', $error_entry, FILE_APPEND | LOCK_EX);
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to send email notification',
        'details' => $e->getMessage()
    ]);
}
?>
