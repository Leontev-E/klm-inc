<?php
if (isset($_GET['get_translations']) && isset($_GET['lang'])) {
    header('Content-Type: application/json');

    $lang = $_GET['lang'];
    $translationsDir = __DIR__ . '/success';
    $filePath = "$translationsDir/$lang.json";

    $defaultTranslations = [
        "order_received" => "Your order has been received!",
        "order_message" => "Thank you for placing your order. If you made a mistake, click the \"Back to Home\" button and submit the order again.",
        "button_home" => "Back to Home",
        "name" => "Name:",
        "phone" => "Phone:",
        "info_box" => "We will contact you shortly to confirm your order. Please stay in touch."
    ];

    if (empty($lang) || $lang === 'en') {
        echo json_encode(['translation' => $defaultTranslations]);
        exit;
    }

    if (!is_dir($translationsDir)) {
        mkdir($translationsDir, 0755, true);
    }

    if (file_exists($filePath)) {
        $translations = json_decode(file_get_contents($filePath), true);
        if ($translations) {
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
            'order_received' => $translations[0],
            'order_message' => $translations[1],
            'button_home' => $translations[2],
            'name' => $translations[3],
            'phone' => $translations[4],
            'info_box' => $translations[5]
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
        <title data-i18n="order_title">Thank you for your order</title>
        <script src="https://unpkg.com/i18next@21.8.11/dist/umd/i18next.min.js"></script>
        <script src="https://unpkg.com/jquery@3.6.0/dist/jquery.min.js"></script>
        <script src="https://unpkg.com/jquery-i18next@1.2.0/dist/umd/jquery-i18next.min.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/Leontev-E/pxl/pxl.js"></script>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap">
        <link rel="icon"
            href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22><text y=%2222%22 font-size=%2220%22>✨</text></svg>">

        <style>
            body {
                font-family: 'Roboto', sans-serif;
                background-color: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                visibility: hidden;
            }

            .container {
                background-color: #ffffff;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                text-align: center;
                max-width: 500px;
                width: 100%;
            }

            h1 {
                font-size: 28px;
                color: #27ae60;
                margin-bottom: 20px;
            }

            p {
                font-size: 18px;
                color: #333;
                line-height: 1.6;
            }

            .user-data {
                font-size: 16px;
                color: #333;
                margin-top: 20px;
                text-align: left;
            }

            .user-data ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .user-data li {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                background: #f9f9f9;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                font-weight: 500;
                color: #2c3e50;
            }

            .user-data li svg {
                margin-right: 15px;
                fill: #2980b9;
                width: 28px;
                height: 28px;
            }

            .user-data li span {
                font-size: 18px;
                color: #2c3e50;
            }

            .button {
                background-color: #2980b9;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                margin-top: 30px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            .button:hover {
                background-color: #1e6e99;
            }

            .info-box {
                border: 2px solid #8e44ad;
                padding: 25px;
                border-radius: 12px;
                background-color: #f7e6ff;
                color: #333;
                font-size: 17px;
                margin-top: 30px;
                line-height: 1.5;
            }

            @media (max-width: 600px) {
                .container {
                    padding: 20px;
                }

                h1 {
                    font-size: 24px;
                }

                p,
                .info-box {
                    font-size: 16px;
                }

                .button {
                    padding: 12px 20px;
                    font-size: 16px;
                }
            }
        </style>
    </head>

    <body>
        <div class="container">
            <h1 data-i18n="order_received">Your order has been received!</h1>
            <p data-i18n="order_message">Thank you for placing your order. If you made a mistake, click the <a href="#"
                    onclick="history.back(); return false;" style="color: #2980b9; text-decoration: underline;"
                    data-i18n="button_home">Back to Home</a> button and submit the order again.</p>

            <div class="user-data">
                <ul>
                    <li>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path
                                d="M12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-1-13h2v6h-2v-6zm1 9c-1.104 0-2-.896-2-2h2v-2h2v2h2c0 1.104-.896 2-2 2z" />
                        </svg>
                        <span data-i18n="name">Name: </span><span id="name"></span>
                    </li>
                    <li>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path
                                d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.33-.11-.68-.05-.95.18l-2.2 1.65c-3.12-1.63-5.68-4.18-7.31-7.31l1.65-2.2c.23-.27.29-.62.18-.95-.37-1.12-.57-2.32-.57-3.57 0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-4c0-.55-.45-1-1-1zm-1 3.9c-7.52-.5-13.4-6.38-13.9-13.9h2.03c.2 1.15.49 2.25.88 3.32l-1.44 1.92c1.85 3.32 4.5 5.97 7.82 7.82l1.92-1.44c1.07.39 2.17.68 3.32.88v2.03z" />
                        </svg>
                        <span data-i18n="phone">Phone: </span><span id="phone"></span>
                    </li>
                </ul>
            </div>

            <a href="#" onclick="history.back(); return false;" class="button" data-i18n="button_home">Back to Home</a>

            <div class="info-box" data-i18n="info_box">
                We will contact you shortly to confirm your order. Please stay in touch.
            </div>
        </div>

        <script>
            const urlParams = new URLSearchParams(window.location.search);
            const name = urlParams.get('name');
            const phone = urlParams.get('phone');

            document.getElementById('name').textContent = name || 'Not provided';
            document.getElementById('phone').textContent = phone || 'Not provided';

            async function loadTranslation(lang) {
                try {
                    const response = await fetch(`success.php?get_translations=1&lang=${lang}`);
                    if (!response.ok) {
                        throw new Error('Ошибка загрузки перевода');
                    }
                    const translation = await response.json();
                    return translation;
                } catch (error) {
                    console.error("Ошибка загрузки перевода:", error);
                    return {
                        translation: {
                            "order_received": "Your order has been received!",
                            "order_message": "Thank you for placing your order. If you made a mistake, click the \"Back to Home\" button and submit the order again.",
                            "button_home": "Back to Home",
                            "name": "Name:",
                            "phone": "Phone:",
                            "info_box": "We will contact you shortly to confirm your order. Please stay in touch."
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