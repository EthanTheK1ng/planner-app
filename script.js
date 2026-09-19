// =========================
// SUPABASE
// =========================

const SUPABASE_URL =
    "https://edcmnuriwutqxprzhkhz.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_22TfmhqUAKMqUIIk_H2qDg_12gWaj2e";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================
// SUBJECT COLORS
// =========================

const subjectColors = {
    "AP Biology": "#22c55e",
    "APUSH": "#3392ff",
    "AP Calculus": "#475775",
    "AP Lang": "#c5c33a",
    "AP Computer Science A": "#171718",
    "Spanish": "#fc0a0a",
    "Gym": "#1de0e0"
};


// =========================
// SUBJECT ICONS
// =========================

const subjectIcons = {
    "AP Biology": "icons/biology.png",
    "APUSH": "icons/apush.png",
    "AP Calculus": "icons/calculus.png",
    "AP Lang": "icons/lang.png",
    "AP Computer Science A": "icons/computer-science.png",
    "Spanish": "icons/spanish.png",
    "Gym": "icons/gym.png"
};


// =========================
// ENTRIES
// =========================

// Entries now come from Supabase,
// NOT localStorage.

let entries = [];


// =========================
// HTML ELEMENTS
// =========================

const currentDateElement =
    document.getElementById(
        "current-date"
    );

const assignmentCountElement =
    document.getElementById(
        "assignment-count"
    );

const examCountElement =
    document.getElementById(
        "exam-count"
    );

const entryList =
    document.getElementById(
        "entry-list"
    );

const dueSoonList =
    document.getElementById(
        "due-soon-list"
    );

const dueSoonSection =
    document.getElementById(
        "due-soon-section"
    );

const upcomingHeader =
    document.getElementById(
        "upcoming-header"
    );

const completedList =
    document.getElementById(
        "completed-list"
    );

const newEntryButton =
    document.getElementById(
        "new-entry-button"
    );

const newEntryDialog =
    document.getElementById(
        "new-entry-dialog"
    );

const newEntryForm =
    document.getElementById(
        "new-entry-form"
    );

const closeEntryButton =
    document.getElementById(
        "close-entry-button"
    );

const entryNameInput =
    document.getElementById(
        "entry-name"
    );

const entrySubjectInput =
    document.getElementById(
        "entry-subject"
    );

const entryTypeInput =
    document.getElementById(
        "entry-type"
    );

const entryDueDateInput =
    document.getElementById(
        "entry-due-date"
    );


// =========================
// REMOVE OLD LOGIN SCREEN
// =========================

// You still have the old auth screen in
// your HTML right now.
//
// This hides it automatically so you
// don't need to remove it immediately.

const authScreen =
    document.getElementById(
        "auth-screen"
    );

const planner =
    document.getElementById(
        "planner"
    );


if (authScreen) {

    authScreen.style.display =
        "none";
}


if (planner) {

    planner.style.display =
        "block";
}


// =========================
// LOAD ENTRIES FROM SUPABASE
// =========================

async function loadEntries() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("entries")
            .select(
                `
                id,
                name,
                subject,
                type,
                due_date,
                completed,
                created_at
                `
            )
            .order(
                "due_date",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Could not load entries:",
            error
        );

        alert(
            "There was a problem loading your planner."
        );

        return;
    }


    // Convert database naming:
    //
    // due_date
    //
    // into the format your existing
    // JavaScript uses:
    //
    // dueDate

    entries =
        data.map(entry => {

            return {

                id:
                    entry.id,

                name:
                    entry.name,

                subject:
                    entry.subject,

                type:
                    entry.type,

                dueDate:
                    entry.due_date,

                completed:
                    entry.completed,

                createdAt:
                    entry.created_at
            };
        });


    updateCounts();

    renderEntries();

    renderCompletedEntries();
}


// =========================
// ADD ENTRY TO DATABASE
// =========================

async function addEntryToDatabase(
    newEntry
) {

    const {
        error
    } =
        await supabaseClient
            .from("entries")
            .insert({

                name:
                    newEntry.name,

                subject:
                    newEntry.subject,

                type:
                    newEntry.type,

                due_date:
                    newEntry.dueDate,

                completed:
                    false
            });


    if (error) {

        console.error(
            "Could not add entry:",
            error
        );

        alert(
            "There was a problem adding the entry."
        );

        return false;
    }


    await loadEntries();


    return true;
}


// =========================
// COMPLETE ENTRY
// =========================

async function completeEntry(
    entry
) {

    const {
        error
    } =
        await supabaseClient
            .from("entries")
            .update({

                completed:
                    true
            })
            .eq(
                "id",
                entry.id
            );


    if (error) {

        console.error(
            "Could not complete entry:",
            error
        );

        alert(
            "There was a problem completing the assignment."
        );

        return false;
    }


    await loadEntries();


    return true;
}


// =========================
// RESTORE ENTRY
// =========================

async function restoreEntry(
    entry
) {

    const {
        error
    } =
        await supabaseClient
            .from("entries")
            .update({

                completed:
                    false
            })
            .eq(
                "id",
                entry.id
            );


    if (error) {

        console.error(
            "Could not restore entry:",
            error
        );

        alert(
            "There was a problem restoring the assignment."
        );

        return false;
    }


    await loadEntries();


    return true;
}


// =========================
// DELETE ENTRY
// =========================

async function deleteEntry(
    entry
) {

    const {
        error
    } =
        await supabaseClient
            .from("entries")
            .delete()
            .eq(
                "id",
                entry.id
            );


    if (error) {

        console.error(
            "Could not delete entry:",
            error
        );

        alert(
            "There was a problem deleting the entry."
        );

        return false;
    }


    await loadEntries();


    return true;
}


// =========================
// MIGRATE OLD LOCALSTORAGE
// =========================

// This allows your OLD saved homework
// from the previous version of the app
// to move into Supabase.
//
// It only does this if:
// 1. localStorage has old entries
// 2. Supabase currently has zero entries
//
// This prevents most duplicate imports.

async function migrateOldEntries() {

    const oldSavedEntries =
        localStorage.getItem(
            "plannerEntries"
        );


    if (!oldSavedEntries) {

        return;
    }


    let oldEntries;


    try {

        oldEntries =
            JSON.parse(
                oldSavedEntries
            );

    } catch (error) {

        console.error(
            "Could not read old localStorage entries:",
            error
        );

        return;
    }


    if (
        !Array.isArray(
            oldEntries
        )
        ||
        oldEntries.length === 0
    ) {

        return;
    }


    const {
        count,
        error: countError
    } =
        await supabaseClient
            .from("entries")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    if (countError) {

        console.error(
            "Could not check database:",
            countError
        );

        return;
    }


    // Only migrate if Supabase is empty.

    if (count > 0) {

        return;
    }


    const entriesToUpload =
        oldEntries.map(entry => {

            return {

                name:
                    entry.name,

                subject:
                    entry.subject,

                type:
                    entry.type,

                due_date:
                    entry.dueDate,

                completed:
                    entry.completed
                        ?? false
            };
        });


    const {
        error
    } =
        await supabaseClient
            .from("entries")
            .insert(
                entriesToUpload
            );


    if (error) {

        console.error(
            "Could not migrate old entries:",
            error
        );

        return;
    }


    console.log(
        "Old planner entries moved to Supabase."
    );


    // Old entries are now safely online.

    localStorage.removeItem(
        "plannerEntries"
    );
}


// =========================
// CURRENT DATE
// =========================

function showCurrentDate() {

    const today =
        new Date();


    const formattedDate =
        today.toLocaleDateString(
            "en-US",
            {
                weekday:
                    "long",

                month:
                    "long",

                day:
                    "numeric"
            }
        );


    currentDateElement.textContent =
        formattedDate;
}


// =========================
// PARSE DATE
// =========================

function parseDate(
    dateString
) {

    const [
        year,
        month,
        day
    ] =
        dateString.split(
            "-"
        );


    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );
}


// =========================
// DAYS UNTIL DUE
// =========================

function getDaysUntilDue(
    dueDate
) {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const due =
        parseDate(
            dueDate
        );


    due.setHours(
        0,
        0,
        0,
        0
    );


    const millisecondsPerDay =
        1000
        *
        60
        *
        60
        *
        24;


    return Math.round(
        (
            due
            -
            today
        )
        /
        millisecondsPerDay
    );
}


// =========================
// SHORT DATE
// =========================

function formatShortDate(
    dateString
) {

    const date =
        parseDate(
            dateString
        );


    return `${
        date.getMonth() + 1
    }/${
        date.getDate()
    }`;
}


// =========================
// DUE TEXT
// =========================

function getDueText(
    dateString
) {

    const daysUntilDue =
        getDaysUntilDue(
            dateString
        );


    if (
        daysUntilDue === 0
    ) {

        return "Today";
    }


    if (
        daysUntilDue === 1
    ) {

        return "Tomorrow";
    }


    if (
        daysUntilDue < 0
    ) {

        return "Overdue";
    }


    return `${
        daysUntilDue
    } days`;
}


// =========================
// CREATE SUBJECT ROW
// =========================

function createSubjectRow(
    entry
) {

    const subjectRow =
        document.createElement(
            "div"
        );


    subjectRow.classList.add(
        "subject-row"
    );


    const icon =
        document.createElement(
            "img"
        );


    icon.classList.add(
        "subject-icon"
    );


    icon.src =
        subjectIcons[
            entry.subject
        ]
        ||
        "";


    icon.alt =
        `${
            entry.subject
        } icon`;


    // Hide broken/missing icons

    icon.addEventListener(
        "error",
        () => {

            icon.style.display =
                "none";
        }
    );


    const subject =
        document.createElement(
            "p"
        );


    subject.classList.add(
        "entry-subject"
    );


    subject.textContent =
        entry.subject;


    subjectRow.appendChild(
        icon
    );


    subjectRow.appendChild(
        subject
    );


    return subjectRow;
}


// =========================
// UPDATE COUNTS
// =========================

function updateCounts() {

    const assignments =
        entries.filter(
            entry => {

                return (
                    entry.type
                    ===
                    "assignment"
                    &&
                    !entry.completed
                );
            }
        );


    const exams =
        entries.filter(
            entry => {

                return (
                    entry.type
                    ===
                    "exam"
                    &&
                    getDaysUntilDue(
                        entry.dueDate
                    )
                    >=
                    0
                );
            }
        );


    assignmentCountElement.textContent =
        assignments.length;


    examCountElement.textContent =
        exams.length;


    const assignmentText =
        assignments.length === 1
            ?
            "assignment to complete"
            :
            "assignments to complete";


    assignmentCountElement
        .parentElement
        .lastChild
        .textContent =
            ` ${assignmentText}`;


    const examText =
        exams.length === 1
            ?
            "exam coming up"
            :
            "exams coming up";


    examCountElement
        .parentElement
        .lastChild
        .textContent =
            ` ${examText}`;
}


// =========================
// RENDER ENTRIES
// =========================

function renderEntries() {

    entryList.innerHTML =
        "";


    dueSoonList.innerHTML =
        "";


    const sortedEntries =
        [
            ...entries
        ].sort(
            (
                a,
                b
            ) => {

                return (
                    parseDate(
                        a.dueDate
                    )
                    -
                    parseDate(
                        b.dueDate
                    )
                );
            }
        );


    let dueSoonCount =
        0;


    let upcomingEntryCount =
        0;


    sortedEntries.forEach(
        entry => {

            // Completed assignments
            // go in the completed section.

            if (
                entry.completed
            ) {

                return;
            }


            // Hide exams that already passed.

            if (
                entry.type
                ===
                "exam"
                &&
                getDaysUntilDue(
                    entry.dueDate
                )
                <
                0
            ) {

                return;
            }


            // =========================
            // CARD
            // =========================

            const article =
                document.createElement(
                    "article"
                );


            article.classList.add(
                "entry",
                entry.type
            );


            const subjectColor =
                subjectColors[
                    entry.subject
                ]
                ||
                "#6b7280";


            article.style.setProperty(
                "--subject-color",
                subjectColor
            );


            // =========================
            // ASSIGNMENT CHECKBOX
            // =========================

            if (
                entry.type
                ===
                "assignment"
            ) {

                const checkbox =
                    document.createElement(
                        "input"
                    );


                checkbox.type =
                    "checkbox";


                checkbox.classList.add(
                    "complete-checkbox"
                );


                checkbox.style.accentColor =
                    subjectColor;


                checkbox.addEventListener(
                    "change",
                    async () => {

                        checkbox.disabled =
                            true;


                        const success =
                            await completeEntry(
                                entry
                            );


                        if (
                            !success
                        ) {

                            checkbox.checked =
                                false;

                            checkbox.disabled =
                                false;
                        }
                    }
                );


                article.appendChild(
                    checkbox
                );
            }


            // =========================
            // DATE
            // =========================

            const entryDate =
                document.createElement(
                    "div"
                );


            entryDate.classList.add(
                "entry-date"
            );


            const daysUntil =
                document.createElement(
                    "p"
                );


            daysUntil.classList.add(
                "days-until"
            );


            daysUntil.textContent =
                getDueText(
                    entry.dueDate
                );


            const shortDate =
                document.createElement(
                    "p"
                );


            shortDate.classList.add(
                "actual-date"
            );


            shortDate.textContent =
                formatShortDate(
                    entry.dueDate
                );


            entryDate.appendChild(
                daysUntil
            );


            entryDate.appendChild(
                shortDate
            );


            // =========================
            // INFO
            // =========================

            const entryInfo =
                document.createElement(
                    "div"
                );


            entryInfo.classList.add(
                "entry-info"
            );


            const subjectRow =
                createSubjectRow(
                    entry
                );


            const name =
                document.createElement(
                    "h3"
                );


            name.classList.add(
                "entry-name"
            );


            name.textContent =
                entry.name;


            entryInfo.appendChild(
                subjectRow
            );


            entryInfo.appendChild(
                name
            );


            article.appendChild(
                entryDate
            );


            article.appendChild(
                entryInfo
            );


            // =========================
            // EXAM CONTROLS
            // =========================

            if (
                entry.type
                ===
                "exam"
            ) {

                const examActions =
                    document.createElement(
                        "div"
                    );


                examActions.classList.add(
                    "exam-actions"
                );


                const examLabel =
                    document.createElement(
                        "span"
                    );


                examLabel.classList.add(
                    "entry-type"
                );


                examLabel.textContent =
                    "Exam";


                const removeButton =
                    document.createElement(
                        "button"
                    );


                removeButton.classList.add(
                    "remove-exam-button"
                );


                removeButton.textContent =
                    "×";


                removeButton.title =
                    "Remove exam";


                removeButton.setAttribute(
                    "aria-label",
                    `Remove ${
                        entry.name
                    }`
                );


                removeButton.addEventListener(
                    "click",
                    async () => {

                        const confirmed =
                            confirm(
                                `Are you sure you want to remove "${
                                    entry.name
                                }"?`
                            );


                        if (
                            !confirmed
                        ) {

                            return;
                        }


                        removeButton.disabled =
                            true;


                        await deleteEntry(
                            entry
                        );
                    }
                );


                examActions.appendChild(
                    examLabel
                );


                examActions.appendChild(
                    removeButton
                );


                article.appendChild(
                    examActions
                );
            }


            // =========================
            // DUE SOON
            // =========================

            const daysUntilDue =
                getDaysUntilDue(
                    entry.dueDate
                );


            const isDueSoonAssignment =
                entry.type
                ===
                "assignment"
                &&
                (
                    daysUntilDue === 0
                    ||
                    daysUntilDue === 1
                );


            if (
                isDueSoonAssignment
            ) {

                article.classList.add(
                    "due-soon-entry"
                );


                dueSoonList.appendChild(
                    article
                );


                dueSoonCount++;

            } else {

                entryList.appendChild(
                    article
                );


                upcomingEntryCount++;
            }
        }
    );


    // Hide Due Soon if empty

    dueSoonSection.style.display =
        dueSoonCount === 0
            ?
            "none"
            :
            "block";


    // Hide Upcoming if empty

    upcomingHeader.style.display =
        upcomingEntryCount === 0
            ?
            "none"
            :
            "block";
}


// =========================
// COMPLETED ASSIGNMENTS
// =========================

function renderCompletedEntries() {

    completedList.innerHTML =
        "";


    const completedAssignments =
        entries.filter(
            entry => {

                return (
                    entry.type
                    ===
                    "assignment"
                    &&
                    entry.completed
                );
            }
        );


    if (
        completedAssignments.length
        ===
        0
    ) {

        const emptyMessage =
            document.createElement(
                "p"
            );


        emptyMessage.classList.add(
            "completed-empty"
        );


        emptyMessage.textContent =
            "No completed assignments yet.";


        completedList.appendChild(
            emptyMessage
        );


        return;
    }


    completedAssignments.forEach(
        entry => {

            const article =
                document.createElement(
                    "article"
                );


            article.classList.add(
                "entry",
                "completed-entry"
            );


            const subjectColor =
                subjectColors[
                    entry.subject
                ]
                ||
                "#6b7280";


            article.style.setProperty(
                "--subject-color",
                subjectColor
            );


            // =========================
            // CHECKBOX
            // =========================

            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.checked =
                true;


            checkbox.classList.add(
                "complete-checkbox"
            );


            checkbox.style.accentColor =
                subjectColor;


            checkbox.addEventListener(
                "change",
                async () => {

                    checkbox.disabled =
                        true;


                    const success =
                        await restoreEntry(
                            entry
                        );


                    if (
                        !success
                    ) {

                        checkbox.checked =
                            true;

                        checkbox.disabled =
                            false;
                    }
                }
            );


            // =========================
            // DATE
            // =========================

            const entryDate =
                document.createElement(
                    "div"
                );


            entryDate.classList.add(
                "entry-date"
            );


            const completedText =
                document.createElement(
                    "p"
                );


            completedText.classList.add(
                "completed-label"
            );


            completedText.textContent =
                "Completed";


            const shortDate =
                document.createElement(
                    "p"
                );


            shortDate.classList.add(
                "actual-date"
            );


            shortDate.textContent =
                formatShortDate(
                    entry.dueDate
                );


            entryDate.appendChild(
                completedText
            );


            entryDate.appendChild(
                shortDate
            );


            // =========================
            // INFO
            // =========================

            const entryInfo =
                document.createElement(
                    "div"
                );


            entryInfo.classList.add(
                "entry-info"
            );


            const subjectRow =
                createSubjectRow(
                    entry
                );


            const name =
                document.createElement(
                    "h3"
                );


            name.classList.add(
                "entry-name"
            );


            name.textContent =
                entry.name;


            entryInfo.appendChild(
                subjectRow
            );


            entryInfo.appendChild(
                name
            );


            // =========================
            // REMOVE
            // =========================

            const removeButton =
                document.createElement(
                    "button"
                );


            removeButton.classList.add(
                "remove-completed-button"
            );


            removeButton.textContent =
                "×";


            removeButton.title =
                "Remove assignment";


            removeButton.setAttribute(
                "aria-label",
                `Remove ${
                    entry.name
                }`
            );


            removeButton.addEventListener(
                "click",
                async () => {

                    const confirmed =
                        confirm(
                            `Are you sure you want to permanently remove "${
                                entry.name
                            }"?`
                        );


                    if (
                        !confirmed
                    ) {

                        return;
                    }


                    removeButton.disabled =
                        true;


                    await deleteEntry(
                        entry
                    );
                }
            );


            // =========================
            // BUILD CARD
            // =========================

            article.appendChild(
                checkbox
            );


            article.appendChild(
                entryDate
            );


            article.appendChild(
                entryInfo
            );


            article.appendChild(
                removeButton
            );


            completedList.appendChild(
                article
            );
        }
    );
}


// =========================
// SUBJECT DROPDOWN
// =========================

function populateSubjects() {

    entrySubjectInput.innerHTML =
        "";


    Object.keys(
        subjectColors
    ).forEach(
        subject => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                subject;


            option.textContent =
                subject;


            entrySubjectInput.appendChild(
                option
            );
        }
    );
}


// =========================
// OPEN NEW ENTRY
// =========================

newEntryButton.addEventListener(
    "click",
    () => {

        entryDueDateInput.min =
            getTodayForInput();


        newEntryDialog.showModal();
    }
);


// =========================
// CLOSE NEW ENTRY
// =========================

closeEntryButton.addEventListener(
    "click",
    () => {

        newEntryDialog.close();
    }
);


// =========================
// ADD ENTRY
// =========================

newEntryForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const submitButton =
            newEntryForm.querySelector(
                ".add-entry-button"
            );


        submitButton.disabled =
            true;


        const newEntry = {

            name:
                entryNameInput
                    .value
                    .trim(),

            subject:
                entrySubjectInput
                    .value,

            type:
                entryTypeInput
                    .value,

            dueDate:
                entryDueDateInput
                    .value,

            completed:
                false
        };


        const success =
            await addEntryToDatabase(
                newEntry
            );


        if (
            success
        ) {

            newEntryForm.reset();


            newEntryDialog.close();
        }


        submitButton.disabled =
            false;
    }
);


// =========================
// TODAY FOR DATE INPUT
// =========================

function getTodayForInput() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${
        year
    }-${
        month
    }-${
        day
    }`;
}


// =========================
// START APP
// =========================

async function startApp() {

    showCurrentDate();


    populateSubjects();


    // Move your old localStorage homework
    // into Supabase if appropriate.

    await migrateOldEntries();


    // Load the current online database.

    await loadEntries();
}


startApp();