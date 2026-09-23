// =========================
// NOTIFICATIONS
// =========================

const REGISTER_PUSH_URL =
    "https://edcmnuriwutqxprzhkhz.supabase.co/functions/v1/register-push";

const VAPID_PUBLIC_KEY_URL =
    "https://edcmnuriwutqxprzhkhz.supabase.co/functions/v1/get-vapid-public-key";


const notificationButton =
    document.getElementById(
        "enable-notifications-button"
    );


let cachedVapidPublicKey =
    null;


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

    const outputArray =
        new Uint8Array(
            rawData.length
        );

    for (
        let i = 0;
        i < rawData.length;
        i++
    ) {
        outputArray[i] =
            rawData.charCodeAt(
                i
            );
    }

    return outputArray;
}


// =========================
// GET VAPID PUBLIC KEY
// =========================

async function getVapidPublicKey() {
    if (
        cachedVapidPublicKey
    ) {
        return cachedVapidPublicKey;
    }

    const response =
        await fetch(
            VAPID_PUBLIC_KEY_URL,
            {
                method:
                    "GET",

                cache:
                    "no-cache"
            }
        );

    if (
        !response.ok
    ) {
        const message =
            await response.text();

        console.error(
            "Could not get VAPID public key:",
            message
        );

        throw new Error(
            "Could not load the notification public key."
        );
    }

    const data =
        await response.json();

    if (
        !data.publicKey
        ||
        typeof data.publicKey
        !==
        "string"
    ) {
        throw new Error(
            "The notification public key response was invalid."
        );
    }

    const keyBytes =
        urlBase64ToUint8Array(
            data.publicKey
        );

    /*
        A normal uncompressed P-256
        VAPID public key is 65 bytes
        and starts with 0x04.
    */

    if (
        keyBytes.length
        !==
        65
        ||
        keyBytes[0]
        !==
        4
    ) {
        console.error(
            "Invalid VAPID key:",
            {
                length:
                    keyBytes.length,

                firstByte:
                    keyBytes[0]
            }
        );

        throw new Error(
            "The notification public key was not valid."
        );
    }

    cachedVapidPublicKey =
        data.publicKey;

    return cachedVapidPublicKey;
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

    const registration =
        await navigator
            .serviceWorker
            .register(
                "./sw.js",
                {
                    updateViaCache:
                        "none"
                }
            );

    try {
        await registration.update();

    } catch (
        error
    ) {
        console.warn(
            "Could not force service worker update:",
            error
        );
    }

    return registration;
}


// =========================
// BUTTON STATE
// =========================

function setNotificationButtonState(
    state
) {
    if (
        !notificationButton
    ) {
        return;
    }

    if (
        state
        ===
        "unsupported"
    ) {
        notificationButton.textContent =
            "Notifications Unsupported";

        notificationButton.disabled =
            true;

        notificationButton.title =
            "Notifications unsupported";

        notificationButton.setAttribute(
            "aria-label",
            "Notifications unsupported"
        );

        return;
    }


    if (
        state
        ===
        "enabled"
    ) {
        notificationButton.textContent =
            "Notifications Enabled";

        notificationButton.disabled =
            true;

        notificationButton.title =
            "Notifications enabled";

        notificationButton.setAttribute(
            "aria-label",
            "Notifications enabled"
        );

        return;
    }


    if (
        state
        ===
        "loading"
    ) {
        notificationButton.textContent =
            "Enabling Notifications";

        notificationButton.disabled =
            true;

        notificationButton.title =
            "Enabling notifications";

        notificationButton.setAttribute(
            "aria-label",
            "Enabling notifications"
        );

        return;
    }


    notificationButton.textContent =
        "Enable Notifications";

    notificationButton.disabled =
        false;

    notificationButton.title =
        "Enable notifications";

    notificationButton.setAttribute(
        "aria-label",
        "Enable notifications"
    );
}


// =========================
// UPDATE BUTTON STATE
// =========================

async function updateNotificationButton() {
    if (
        !notificationButton
    ) {
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
            "serviceWorker"
            in
            navigator
        )
        ||
        !(
            "PushManager"
            in
            window
        )
    ) {
        setNotificationButtonState(
            "unsupported"
        );

        return;
    }


    if (
        Notification.permission
        !==
        "granted"
    ) {
        setNotificationButtonState(
            "available"
        );

        return;
    }


    try {
        const registration =
            await navigator
                .serviceWorker
                .ready;

        const subscription =
            await registration
                .pushManager
                .getSubscription();

        if (
            subscription
        ) {
            setNotificationButtonState(
                "enabled"
            );

        } else {
            setNotificationButtonState(
                "available"
            );
        }

    } catch (
        error
    ) {
        console.error(
            "Could not check notification status:",
            error
        );

        setNotificationButtonState(
            "available"
        );
    }
}


// =========================
// REGISTER SUBSCRIPTION
// =========================

async function registerSubscriptionWithServer(
    subscription,
    pin
) {
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
            "Push registration failed:",
            message
        );

        throw new Error(
            "Could not register this device."
        );
    }

    return true;
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
            ||
            !(
                "serviceWorker"
                in
                navigator
            )
        ) {
            alert(
                "This browser does not support Web Push notifications."
            );

            return;
        }


        setNotificationButtonState(
            "loading"
        );


        const permission =
            await Notification
                .requestPermission();


        if (
            permission
            !==
            "granted"
        ) {
            setNotificationButtonState(
                "available"
            );

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


        /*
            If this browser already has a
            subscription, don't create another.
        */

        if (
            subscription
        ) {
            await updateNotificationButton();

            return;
        }


        /*
            Get the SAME public key that belongs
            to your existing VAPID private key.
        */

        const vapidPublicKey =
            await getVapidPublicKey();


        const applicationServerKey =
            urlBase64ToUint8Array(
                vapidPublicKey
            );


        subscription =
            await registration
                .pushManager
                .subscribe(
                    {
                        userVisibleOnly:
                            true,

                        applicationServerKey:
                            applicationServerKey
                    }
                );


        /*
            Ask for the PIN only when this is
            actually a new browser/device.
        */

        const pin =
            prompt(
                "Enter your notification setup PIN:"
            );


        /*
            If they cancel, remove the new local
            subscription so clicking again works
            normally instead of getting stuck.
        */

        if (
            !pin
        ) {
            await subscription.unsubscribe();

            setNotificationButtonState(
                "available"
            );

            return;
        }


        try {
            await registerSubscriptionWithServer(
                subscription,
                pin
            );

        } catch (
            error
        ) {
            /*
                If registration fails, delete the
                browser subscription so you can
                immediately retry with the correct
                PIN.
            */

            try {
                await subscription.unsubscribe();

            } catch (
                unsubscribeError
            ) {
                console.error(
                    "Could not remove failed subscription:",
                    unsubscribeError
                );
            }

            throw error;
        }


        await updateNotificationButton();


        alert(
            "Notifications are enabled on this device."
        );

    } catch (
        error
    ) {
        console.error(
            "Notification setup failed:",
            error
        );

        setNotificationButtonState(
            "available"
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
// STARTUP
// =========================

async function startNotifications() {
    try {
        await registerServiceWorker();

        await navigator
            .serviceWorker
            .ready;

        await updateNotificationButton();

    } catch (
        error
    ) {
        console.error(
            "Notification startup failed:",
            error
        );

        setNotificationButtonState(
            "available"
        );
    }
}


startNotifications();
