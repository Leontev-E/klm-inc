<?php
if (isset($_GET['get_translations']) && isset($_GET['lang'])) {
    header('Content-Type: application/json');

    $lang = preg_replace('/[^a-zA-Z]/', '', $_GET['lang']); // Безопасная очистка
    $translationsDir = __DIR__ . '/error';
    $filePath = "$translationsDir/$lang.json";

    $defaultTranslations = [
        "error_title" => "Error",
        "error_heading" => "Error!",
        "error_message" => "Please check your details. If you see an error, click the \"Back\" button and submit your request again.",
        "button_back" => "Back",
        "name" => "Name:",
        "phone" => "Phone:",
        "info_box" => "If your details are correct, please wait — we will contact you soon. Thank you for your patience!"
    ];

    $predefinedTranslations = [
        'ru' => [
            "error_title" => "Ошибка",
            "error_heading" => "Ошибка!",
            "error_message" => "Пожалуйста, проверьте ваши данные. Если вы видите ошибку, нажмите кнопку \"Назад\" и отправьте запрос снова.",
            "button_back" => "Назад",
            "name" => "Имя:",
            "phone" => "Телефон:",
            "info_box" => "Если ваши данные верны, пожалуйста, подождите — мы свяжемся с вами в ближайшее время. Спасибо за ваше терпение!"
        ]
    ];

    if (empty($lang) || $lang === 'en') {
        echo json_encode(['translation' => $defaultTranslations]);
        exit;
    }

    if (isset($predefinedTranslations[$lang])) {
        echo json_encode(['translation' => $predefinedTranslations[$lang]]);
        exit;
    }

    if (!is_dir($translationsDir)) {
        mkdir($translationsDir, 0755, true);
    }

    if (file_exists($filePath)) {
        $translations = json_decode(file_get_contents($filePath), true);
        if ($translations && isset($translations['translation'])) {
            echo json_encode($translations);
            exit;
        }
    }

    $texts = array_values($defaultTranslations);
    $translations = [];
    foreach ($texts as $text) {
        $url = "https://api.mymemory.translated.net/get?q=" . urlencode($text) . "&langpair=en|$lang";
        $response = @file_get_contents($url);
        if ($response !== false) {
            $data = json_decode($response, true);
            if (isset($data['responseStatus']) && $data['responseStatus'] == 200 && isset($data['responseData']['translatedText'])) {
                $translations[] = $data['responseData']['translatedText'];
            } else {
                $translations[] = $text;
            }
        } else {
            $translations[] = $text;
        }
    }

    $translationObject = [
        'translation' => [
            'error_title' => $translations[0],
            'error_heading' => $translations[1],
            'error_message' => $translations[2],
            'button_back' => $translations[3],
            'name' => $translations[4],
            'phone' => $translations[5],
            'info_box' => $translations[6]
        ]
    ];

    file_put_contents($filePath, json_encode($translationObject, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode($translationObject);
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title data-i18n="error_title">Error</title>
        <script src="https://unpkg.com/i18next@21.8.11/dist/umd/i18next.min.js"></script>
        <script src="https://unpkg.com/jquery@3.6.0/dist/jquery.min.js"></script>
        <script src="https://unpkg.com/jquery-i18next@1.2.0/dist/umd/jquery-i18next.min.js"></script>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Arial:wght@400;700&display=swap">
        <link rel="icon"
            href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><text y=%2222%22 font-size=%2220%22>😞</text></svg>">

        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                visibility: hidden;
            }

            .container {
                background-color: #fff;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 400px;
                width: 100%;
            }

            h1 {
                font-size: 24px;
                color: #e74c3c;
                margin-bottom: 15px;
            }

            p {
                font-size: 16px;
                color: #333;
                line-height: 1.5;
            }

            .user-data {
                font-size: 16px;
                color: #333;
                margin-top: 10px;
                text-align: left;
            }

            .user-data ul {
                list-style: none;
                padding: 0;
            }

            .user-data li {
                margin-bottom: 8px;
                font-weight: bold;
                color: #2c3e50;
            }

            .button {
                background-color: #007bff;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
                cursor: pointer;
                transition: background-color 0.3s;
            }

            .button:hover {
                background-color: #0056b3;
            }

            .info-box {
                border: 2px solid #f1c40f;
                padding: 15px;
                border-radius: 8px;
                background-color: #fcf3cf;
                color: #333;
                font-size: 16px;
                margin-top: 20px;
                line-height: 1.4;
            }
        </style>
    </head>

    <body>
        <div class="container">
            <h1 data-i18n="error_heading">Error!</h1>
            <p data-i18n="error_message">Please check your details. If you see an error, click the <a href="#"
                    onclick="history.back(); return false;" style="color: #007bff; text-decoration: underline;"
                    data-i18n="button_back">Back</a> button and submit your request again.</p>

            <div class="user-data">
                <ul>
                    <li><span data-i18n="name">Name: </span><span id="name"></span></li>
                    <li><span data-i18n="phone">Phone: </span><span id="phone"></span></li>
                </ul>
            </div>

            <a href="#" onclick="history.back(); return false;" class="button" data-i18n="button_back">Back</a>

            <div class="info-box" data-i18n="info_box">If your details are correct, please wait — we will contact you
                soon. Thank you for your patience!</div>
        </div>

        <script>
            const urlParams = new URLSearchParams(window.location.search);
            const name = urlParams.get('name');
            const phone = urlParams.get('phone');

            document.getElementById('name').textContent = name || 'Not provided';
            document.getElementById('phone').textContent = phone || 'Not provided';

            async function loadTranslation(lang) {
                try {
                    const response = await fetch(`error.php?get_translations=1&lang=${lang}`);
                    if (!response.ok) {
                        throw new Error('Ошибка загрузки перевода');
                    }
                    const translation = await response.json();
                    return translation;
                } catch (error) {
                    console.error("Ошибка загрузки перевода:", error);
                    return {
                        translation: {
                            "error_title": "Error",
                            "error_heading": "Error!",
                            "error_message": "Please check your details. If you see an error, click the \"Back\" button and submit your request again.",
                            "button_back": "Back",
                            "name": "Name:",
                            "phone": "Phone:",
                            "info_box": "If your details are correct, please wait — we will contact you soon. Thank you for your patience!"
                        }
                    };
                }
            }

            i18next.init({
                lng: navigator.language.split('-')[0] || 'en',
                debug: true,
                resources: {}
            }, async function (err, t) {
                const lang = i18next.language;
                const translation = await loadTranslation(lang);
                i18next.addResourceBundle(lang, 'translation', translation.translation);
                jqueryI18next.init(i18next, $, { useOptionsAttr: true });
                $('body').localize();
                document.documentElement.lang = lang;
                document.body.style.visibility = 'visible';
            });
        </script>
    </body>

</html>