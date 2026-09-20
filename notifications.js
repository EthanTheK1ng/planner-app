// =========================
// NOTIFICATIONS
// =========================

const VAPID_PUBLIC_KEY =
    "BGeDXLumj1HOQW-IPVYJm4eJfaQxqHeYE8N4RCqa3g_k_JumRpOLMg_sscTklYBd2aMBMf7QeKR16wXTD7CqJDU";


const REGISTER_PUSH_URL =
    "https://edcmnuriwutqxprzhkhz.supabase.co/functions/v1/register-push";


const notificationButton =
    document.getElementById(
        "enable-notifications-button"
    );


// =========================
// BASE64 -> UINT8ARRAY
// =========================

function urlBase64ToUint8Array(
    base64String
) {

    const padding =
        "=".repeat(
            (
                4
                -
                base64String.length % 4
            )
            %
            4
        );


    const base64 =
        (
            base64String
            +
            padding
        )
            .replace(
                /-/g,
                "+"
            )
            .replace(
                /_/g,
                "/"
            );


    const rawData =
        window.atob(
            base64
        );


    return Uint8Array.from(
        [
            ...rawData
        ].map(
            character =>
                character.charCodeAt(0)
        )
    );
}


// =========================
// IOS CHECK
// =========================

function isIOS() {

    return (
        /iPad|iPhone|iPod/
            .test(
                navigator.userAgent
            )
        ||
        (
            navigator.platform
            ===
            "MacIntel"
            &&
            navigator.maxTouchPoints
            >
            1
        )
    );
}


function isStandalone() {

    return (
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches
        ||
        window.navigator
            .standalone
        ===
        true
    );
}


// =========================
// REGISTER SERVICE WORKER
// =========================

async function registerServiceWorker() {

    if (
        !(
            "serviceWorker"
            in
            navigator
        )
    ) {

        throw new Error(
            "Service workers are not supported."
        );
    }


    return await navigator
        .serviceWorker
        .register(
            "./sw.js"
        );
}


// =========================
// ENABLE PUSH
// =========================

async function enableNotifications() {

    try {

        if (
            !window.isSecureContext
        ) {

            alert(
                "Notifications require HTTPS."
            );

            return;
        }


        if (
            isIOS()
            &&
            !isStandalone()
        ) {

            alert(
                "On iPhone, first add the Planner to your Home Screen. Then open it from the Home Screen and enable notifications."
            );

            return;
        }


        if (
            !(
                "Notification"
                in
                window
            )
            ||
            !(
                "PushManager"
                in
                window
            )
        ) {

            alert(
                "This browser does not support Web Push notifications."
            );

            return;
        }


        const permission =
            await Notification
                .requestPermission();


        if (
            permission
            !==
            "granted"
        ) {

            alert(
                "Notifications were not allowed."
            );

            return;
        }


        const registration =
            await registerServiceWorker();


        await navigator
            .serviceWorker
            .ready;


        let subscription =
            await registration
                .pushManager
                .getSubscription();


        if (
            !subscription
        ) {

            subscription =
                await registration
                    .pushManager
                    .subscribe(
                        {
                            userVisibleOnly:
                                true,

                            applicationServerKey:
                                urlBase64ToUint8Array(
                                    VAPID_PUBLIC_KEY
                                )
                        }
                    );
        }


        const pin =
            prompt(
                "Enter your notification setup PIN:"
            );


        if (
            !pin
        ) {

            return;
        }


        const response =
            await fetch(
                REGISTER_PUSH_URL,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "x-notification-pin":
                            pin
                    },

                    body:
                        JSON.stringify(
                            {
                                subscription:
                                    subscription
                                        .toJSON(),

                                deviceName:
                                    navigator.userAgent
                            }
                        )
                }
            );


        if (
            !response.ok
        ) {

            const message =
                await response.text();


            console.error(
                message
            );


            alert(
                "Could not register notifications. Check your PIN."
            );

            return;
        }


        notificationButton
            .textContent =
            "Notifications Enabled";


        notificationButton
            .disabled =
            true;


        alert(
            "Notifications are enabled on this device."
        );

    } catch (error) {

        console.error(
            "Notification setup failed:",
            error
        );


        alert(
            "Notification setup failed. Check the console."
        );
    }
}


// =========================
// BUTTON
// =========================

notificationButton
    ?.addEventListener(
        "click",
        enableNotifications
    );


// =========================
// INITIAL SERVICE WORKER
// =========================

registerServiceWorker()
    .catch(
        error => {

            console.error(
                "Service worker registration failed:",
                error
            );
        }
    );
