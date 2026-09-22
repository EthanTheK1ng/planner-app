// =========================
// SUPABASE
// =========================

let entriesRealtimeChannel = null;
let suppressRealtimeReload = false;

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
// SUBJECTS
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
// STATE
// =========================

let entries = [];

let editingEntryId = null;
let actionEntry = null;
let noDueDateSelected = false;


// =========================
// HTML ELEMENTS
// =========================

const loadingScreen =
    document.getElementById(
        "app-loading-screen"
    );

const greetingText =
    document.getElementById(
        "greeting-text"
    );

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

const entryGroups =
    document.getElementById(
        "entry-groups"
    );

const completedList =
    document.getElementById(
        "completed-list"
    );

const clearCompletedButton =
    document.getElementById(
        "clear-completed-button"
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

const entryDialogTitle =
    document.getElementById(
        "entry-dialog-title"
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

const subjectOptions =
    document.getElementById(
        "subject-options"
    );

const entryTypeInput =
    document.getElementById(
        "entry-type"
    );

const typeOptions =
    document.getElementById(
        "type-options"
    );

const entryDueDateInput =
    document.getElementById(
        "entry-due-date"
    );

const noDueDateButton =
    document.getElementById(
        "no-due-date-button"
    );

const saveEntryButton =
    document.getElementById(
        "save-entry-button"
    );

const saveEntryButtonText =
    document.getElementById(
        "save-entry-button-text"
    );

const entryActionsDialog =
    document.getElementById(
        "entry-actions-dialog"
    );

const actionsEntryName =
    document.getElementById(
        "actions-entry-name"
    );

const editEntryButton =
    document.getElementById(
        "edit-entry-button"
    );

const deleteEntryButton =
    document.getElementById(
        "delete-entry-button"
    );

const cancelEntryActionsButton =
    document.getElementById(
        "cancel-entry-actions-button"
    );


// =========================
// LOADING
// =========================

function hideLoadingScreen() {

    loadingScreen.classList.add(
        "hidden"
    );
}


// =========================
// GREETING
// =========================

function showGreeting() {

    const hour =
        new Date().getHours();

    const timeGreeting =
        hour < 12
            ?
            "Good morning, Ethan"
            :
            hour < 18
                ?
                "Good afternoon, Ethan"
                :
                "Good evening, Ethan";

    const greetings = [
        "Welcome, Ethan",
        "Time to get some stuff done, Ethan?",
        "What’s on the list, Ethan?",
        "Let’s make some progress, Ethan",
        "One thing at a time, Ethan",
        timeGreeting
    ];

    greetingText.textContent =
        greetings[
            Math.floor(
                Math.random()
                *
                greetings.length
            )
        ];
}


// =========================
// CURRENT DATE
// =========================

function showCurrentDate() {

    const today =
        new Date();

    currentDateElement.textContent =
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
}


// =========================
// DATE HELPERS
// =========================

function parseDate(
    dateString
) {

    if (
        !dateString
    ) {

        return null;
    }

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


function getDaysUntilDue(
    dueDate
) {

    if (
        !dueDate
    ) {

        return null;
    }

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


function formatShortDate(
    dateString
) {

    if (
        !dateString
    ) {

        return "No date";
    }

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


function getDueText(
    dateString
) {

    if (
        !dateString
    ) {

        return "No due date";
    }

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


function formatGroupTitle(
    dateString
) {

    if (
        !dateString
        ||
        dateString === "none"
    ) {

        return "No Due Date";
    }

    const date =
        parseDate(
            dateString
        );

    const daysUntil =
        getDaysUntilDue(
            dateString
        );

    const dateText =
        date.toLocaleDateString(
            "en-US",
            {
                month:
                    "short",

                day:
                    "numeric"
            }
        );

    if (
        daysUntil === 0
    ) {

        return `Today · ${dateText}`;
    }

    if (
        daysUntil === 1
    ) {

        return `Tomorrow · ${dateText}`;
    }

    if (
        daysUntil < 0
    ) {

        return `Overdue · ${dateText}`;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            weekday:
                "long",

            month:
                "short",

            day:
                "numeric"
        }
    );
}


// =========================
// LOAD DATA
// =========================

async function loadEntries() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "entries"
            )
            .select(
                "*"
            )
            .order(
                "due_date",
                {
                    ascending:
                        true,

                    nullsFirst:
                        false
                }
            )
            .order(
                "sort_order",
                {
                    ascending:
                        true
                }
            );

    if (
        error
    ) {

        console.error(
            "Error loading entries:",
            error
        );

        alert(
            "There was a problem loading your planner."
        );

        return false;
    }

    entries =
        data.map(
            entry => ({
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

                sortOrder:
                    entry.sort_order
                    ??
                    0
            })
        );

    renderAll();

    return true;
}


// =========================
// REALTIME
// =========================

function subscribeToEntryChanges() {

    if (
        entriesRealtimeChannel
    ) {

        supabaseClient.removeChannel(
            entriesRealtimeChannel
        );
    }

    entriesRealtimeChannel =
        supabaseClient
            .channel(
                "entries-realtime"
            )
            .on(
                "postgres_changes",
                {
                    event:
                        "*",

                    schema:
                        "public",

                    table:
                        "entries"
                },
                async payload => {

                    console.log(
                        "Homework changed:",
                        payload
                    );

                    if (
                        suppressRealtimeReload
                    ) {

                        return;
                    }

                    await loadEntries();
                }
            )
            .subscribe(
                status => {

                    console.log(
                        "Realtime status:",
                        status
                    );
                }
            );
}


// =========================
// DATABASE WRITES
// =========================

function sameGroup(
    entry,
    type,
    dueDate
) {

    return (
        entry.type === type
        &&
        (
            entry.dueDate
            ||
            null
        )
        ===
        (
            dueDate
            ||
            null
        )
    );
}


function getNextSortOrder(
    type,
    dueDate
) {

    const matchingEntries =
        entries.filter(
            entry =>
                sameGroup(
                    entry,
                    type,
                    dueDate
                )
        );

    if (
        matchingEntries.length === 0
    ) {

        return 0;
    }

    return (
        Math.max(
            ...matchingEntries.map(
                entry =>
                    entry.sortOrder
                    ??
                    0
            )
        )
        +
        1
    );
}


async function addEntryToDatabase(
    newEntry
) {

    const {
        error
    } =
        await supabaseClient
            .from(
                "entries"
            )
            .insert(
                {
                    name:
                        newEntry.name,

                    subject:
                        newEntry.subject,

                    type:
                        newEntry.type,

                    due_date:
                        newEntry.dueDate,

                    completed:
                        false,

                    sort_order:
                        getNextSortOrder(
                            newEntry.type,
                            newEntry.dueDate
                        )
                }
            );

    if (
        error
    ) {

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


async function updateEntryInDatabase(
    entry,
    updatedEntry
) {

    const movedGroups =
        !sameGroup(
            entry,
            updatedEntry.type,
            updatedEntry.dueDate
        );

    const nextSortOrder =
        movedGroups
            ?
            getNextSortOrder(
                updatedEntry.type,
                updatedEntry.dueDate
            )
            :
            entry.sortOrder;

    const {
        error
    } =
        await supabaseClient
            .from(
                "entries"
            )
            .update(
                {
                    name:
                        updatedEntry.name,

                    subject:
                        updatedEntry.subject,

                    type:
                        updatedEntry.type,

                    due_date:
                        updatedEntry.dueDate,

                    sort_order:
                        nextSortOrder
                }
            )
            .eq(
                "id",
                entry.id
            );

    if (
        error
    ) {

        console.error(
            "Could not update entry:",
            error
        );

        alert(
            "There was a problem saving your changes."
        );

        return false;
    }

    await loadEntries();

    return true;
}


async function completeEntry(
    entry
) {

    const {
        error
    } =
        await supabaseClient
            .from(
                "entries"
            )
            .update(
                {
                    completed:
                        true
                }
            )
            .eq(
                "id",
                entry.id
            );

    if (
        error
    ) {

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


async function restoreEntry(
    entry
) {

    const {
        error
    } =
        await supabaseClient
            .from(
                "entries"
            )
            .update(
                {
                    completed:
                        false
                }
            )
            .eq(
                "id",
                entry.id
            );

    if (
        error
    ) {

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


async function deleteEntry(
    entry
) {

    const {
        error
    } =
        await supabaseClient
            .from(
                "entries"
            )
            .delete()
            .eq(
                "id",
                entry.id
            );

    if (
        error
    ) {

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


async function clearCompletedAssignments() {

    const completedAssignments =
        entries.filter(
            entry =>
                entry.type === "assignment"
                &&
                entry.completed
        );

    if (
        completedAssignments.length === 0
    ) {

        return;
    }

    clearCompletedButton.disabled =
        true;

    clearCompletedButton.textContent =
        "Clearing…";

    const {
        error
    } =
        await supabaseClient
            .from(
                "entries"
            )
            .delete()
            .eq(
                "type",
                "assignment"
            )
            .eq(
                "completed",
                true
            );

    if (
        error
    ) {

        console.error(
            "Could not clear completed assignments:",
            error
        );

        alert(
            "There was a problem clearing the completed assignments."
        );

        clearCompletedButton.disabled =
            false;

        clearCompletedButton.textContent =
            "Clear";

        return;
    }

    await loadEntries();

    clearCompletedButton.disabled =
        false;

    clearCompletedButton.textContent =
        "Clear";
}


// =========================
// COUNTS
// =========================

function isVisibleAssessment(
    entry
) {

    if (
        entry.type !== "exam"
        &&
        entry.type !== "quiz"
    ) {

        return false;
    }

    if (
        !entry.dueDate
    ) {

        return true;
    }

    return (
        getDaysUntilDue(
            entry.dueDate
        )
        >=
        0
    );
}


function updateCounts() {

    const assignments =
        entries.filter(
            entry =>
                entry.type === "assignment"
                &&
                !entry.completed
        );

    const assessments =
        entries.filter(
            entry =>
                isVisibleAssessment(
                    entry
                )
        );

    assignmentCountElement.textContent =
        assignments.length;

    examCountElement.textContent =
        assessments.length;

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

    const assessmentText =
        assessments.length === 1
            ?
            "exam/quiz coming up"
            :
            "exams/quizzes coming up";

    examCountElement
        .parentElement
        .lastChild
        .textContent =
            ` ${assessmentText}`;
}


// =========================
// SUBJECT ROW
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
// ENTRY CARD
// =========================

function createEntryCard(
    entry,
    options = {}
) {

    const {
        completedView = false,
        draggable = false
    } =
        options;

    const article =
        document.createElement(
            "article"
        );

    article.classList.add(
        "entry"
    );

    if (
        !completedView
        &&
        entry.type === "assignment"
        &&
        getDaysUntilDue(
            entry.dueDate
        ) === 1
    ) {

        article.classList.add(
            "tomorrow-entry"
        );
    }

    if (
        completedView
    ) {

        article.classList.add(
            "completed-entry"
        );
    }

    article.dataset.entryId =
        String(
            entry.id
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


    // Swipe-right preview behind the card.

    const swipePreview =
        document.createElement(
            "div"
        );

    swipePreview.classList.add(
        "swipe-preview"
    );

    swipePreview.setAttribute(
        "aria-hidden",
        "true"
    );

    const swipeIcon =
        document.createElement(
            "span"
        );

    swipeIcon.classList.add(
        "swipe-preview-icon"
    );

    swipeIcon.innerHTML =
        `<svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>`;

    const swipeText =
        document.createElement(
            "span"
        );

    swipeText.textContent =
        "Edit";

    swipePreview.appendChild(
        swipeIcon
    );

    swipePreview.appendChild(
        swipeText
    );

    article.appendChild(
        swipePreview
    );


    // Visible card content moves right while swiping.

    const content =
        document.createElement(
            "div"
        );

    content.classList.add(
        "entry-content"
    );

    article.appendChild(
        content
    );


    // Drag handle

    if (
        draggable
    ) {

        const dragHandle =
            document.createElement(
                "button"
            );

        dragHandle.type =
            "button";

        dragHandle.classList.add(
            "drag-handle"
        );

        dragHandle.textContent =
            "⋮⋮";

        dragHandle.title =
            "Drag to reorder";

        dragHandle.setAttribute(
            "aria-label",
            "Drag to reorder"
        );

        content.appendChild(
            dragHandle
        );
    }


    // Assignment checkbox

    if (
        entry.type === "assignment"
    ) {

        const checkbox =
            document.createElement(
                "input"
            );

        checkbox.type =
            "checkbox";

        checkbox.checked =
            Boolean(
                entry.completed
            );

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
                    entry.completed
                        ?
                        await restoreEntry(
                            entry
                        )
                        :
                        await completeEntry(
                            entry
                        );

                if (
                    !success
                ) {

                    checkbox.checked =
                        Boolean(
                            entry.completed
                        );

                    checkbox.disabled =
                        false;
                }
            }
        );

        content.appendChild(
            checkbox
        );
    }


    // Date

    const entryDate =
        document.createElement(
            "div"
        );

    entryDate.classList.add(
        "entry-date"
    );

    const dueText =
        document.createElement(
            "p"
        );

    dueText.classList.add(
        completedView
            ?
            "completed-label"
            :
            "days-until"
    );

    dueText.textContent =
        completedView
            ?
            "Completed"
            :
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
        dueText
    );

    entryDate.appendChild(
        shortDate
    );


    // Main info

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

    content.appendChild(
        entryDate
    );

    content.appendChild(
        entryInfo
    );


    // Exam / quiz label

    if (
        entry.type === "exam"
        ||
        entry.type === "quiz"
    ) {

        const typeLabel =
            document.createElement(
                "span"
            );

        typeLabel.classList.add(
            "entry-type",
            entry.type
        );

        typeLabel.textContent =
            entry.type === "exam"
                ?
                "Exam"
                :
                "Quiz";

        content.appendChild(
            typeLabel
        );
    }


    addSwipeActions(
        article,
        content,
        swipePreview,
        entry
    );

    return article;
}

// =========================
// GROUPING
// =========================

function sortEntriesWithinGroup(
    groupEntries
) {

    const typePriority = {
        exam: 0,
        quiz: 1,
        assignment: 1
    };

    return [
        ...groupEntries
    ].sort(
        (
            a,
            b
        ) => {

            const priorityDifference =
                (
                    typePriority[a.type]
                    ??
                    99
                )
                -
                (
                    typePriority[b.type]
                    ??
                    99
                );

            if (
                priorityDifference !== 0
            ) {

                return priorityDifference;
            }

            const orderDifference =
                (
                    a.sortOrder
                    ??
                    0
                )
                -
                (
                    b.sortOrder
                    ??
                    0
                );

            if (
                orderDifference !== 0
            ) {

                return orderDifference;
            }

            return (
                Number(a.id)
                -
                Number(b.id)
            );
        }
    );
}

function groupEntriesByDate(
    list
) {

    const groups =
        new Map();

    list.forEach(
        entry => {

            const key =
                entry.dueDate
                ||
                "none";

            if (
                !groups.has(
                    key
                )
            ) {

                groups.set(
                    key,
                    []
                );
            }

            groups
                .get(
                    key
                )
                .push(
                    entry
                );
        }
    );

    return [
        ...groups.entries()
    ].sort(
        (
            [keyA],
            [keyB]
        ) => {

            if (
                keyA === "none"
            ) {

                return 1;
            }

            if (
                keyB === "none"
            ) {

                return -1;
            }

            return keyA.localeCompare(
                keyB
            );
        }
    );
}


function renderGroupedEntries(
    container,
    list,
    emptyMessage
) {

    container.innerHTML =
        "";

    if (
        list.length === 0
    ) {

        const empty =
            document.createElement(
                "p"
            );

        empty.classList.add(
            "empty-state"
        );

        empty.textContent =
            emptyMessage;

        container.appendChild(
            empty
        );

        return;
    }

    const groups =
        groupEntriesByDate(
            list
        );

    groups.forEach(
        (
            [
                dateKey,
                groupEntries
            ]
        ) => {

            const group =
                document.createElement(
                    "section"
                );

            group.classList.add(
                "date-group"
            );

            const title =
                document.createElement(
                    "p"
                );

            title.classList.add(
                "date-group-title"
            );

            title.textContent =
                formatGroupTitle(
                    dateKey
                );

            const listElement =
                document.createElement(
                    "div"
                );

            listElement.classList.add(
                "entry-group-list"
            );

            listElement.dataset.dateKey =
                dateKey;

            sortEntriesWithinGroup(
                groupEntries
            )
                .forEach(
                    entry => {

                        listElement.appendChild(
                            createEntryCard(
                                entry,
                                {
                                    draggable:
                                        true
                                }
                            )
                        );
                    }
                );

            group.appendChild(
                title
            );

            group.appendChild(
                listElement
            );

            container.appendChild(
                group
            );
        }
    );

    initializeSortables(
        container
    );
}


// =========================
// RENDER ALL
// =========================

function renderAll() {

    updateCounts();

    const openEntries =
        entries.filter(
            entry =>
                (
                    entry.type === "assignment"
                    &&
                    !entry.completed
                )
                ||
                isVisibleAssessment(
                    entry
                )
        );

    renderGroupedEntries(
        entryGroups,
        openEntries,
        "No assignments, exams, or quizzes right now."
    );

    renderCompletedEntries();
}

// =========================
// COMPLETED
// =========================

function renderCompletedEntries() {

    completedList.innerHTML =
        "";

    const completedAssignments =
        entries.filter(
            entry =>
                entry.type === "assignment"
                &&
                entry.completed
        );

    clearCompletedButton.style.display =
        completedAssignments.length === 0
            ?
            "none"
            :
            "inline-flex";

    if (
        completedAssignments.length === 0
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

    sortEntriesWithinGroup(
        completedAssignments
    )
        .forEach(
            entry => {

                completedList.appendChild(
                    createEntryCard(
                        entry,
                        {
                            completedView:
                                true,

                            draggable:
                                false
                        }
                    )
                );
            }
        );
}


// =========================
// DRAG + DROP
// =========================

function initializeSortables(
    root
) {

    if (
        typeof Sortable ===
        "undefined"
    ) {

        console.warn(
            "SortableJS did not load, so drag-to-reorder is unavailable."
        );

        return;
    }

    root.querySelectorAll(
        ".entry-group-list"
    )
        .forEach(
            listElement => {

                Sortable.create(
                    listElement,
                    {
                        animation:
                            160,

                        handle:
                            ".drag-handle",

                        ghostClass:
                            "sortable-ghost",

                        chosenClass:
                            "sortable-chosen",

                        onEnd:
                            async () => {

                                await persistOrder(
                                    listElement
                                );
                            }
                    }
                );
            }
        );
}


async function persistOrder(
    listElement
) {

    const cards =
        [
            ...listElement.querySelectorAll(
                ".entry[data-entry-id]"
            )
        ];

    suppressRealtimeReload =
        true;

    try {

        const updates =
            cards.map(
                (
                    card,
                    index
                ) => {

                    const id =
                        Number(
                            card.dataset.entryId
                        );

                    const localEntry =
                        entries.find(
                            entry =>
                                Number(
                                    entry.id
                                )
                                ===
                                id
                        );

                    if (
                        localEntry
                    ) {

                        localEntry.sortOrder =
                            index;
                    }

                    return supabaseClient
                        .from(
                            "entries"
                        )
                        .update(
                            {
                                sort_order:
                                    index
                            }
                        )
                        .eq(
                            "id",
                            id
                        );
                }
            );

        const results =
            await Promise.all(
                updates
            );

        const failed =
            results.find(
                result =>
                    result.error
            );

        if (
            failed
        ) {

            throw failed.error;
        }

    } catch (
        error
    ) {

        console.error(
            "Could not save entry order:",
            error
        );

        alert(
            "There was a problem saving the new order."
        );

    } finally {

        suppressRealtimeReload =
            false;

        await loadEntries();
    }
}


// =========================
// SWIPE RIGHT ACTIONS
// =========================

function addSwipeActions(
    article,
    content,
    swipePreview,
    entry
) {

    let startX =
        0;

    let startY =
        0;

    let currentX =
        0;

    let tracking =
        false;

    article.addEventListener(
        "pointerdown",
        event => {

            if (
                event.target.closest(
                    "button, input"
                )
            ) {

                return;
            }

            tracking =
                true;

            startX =
                event.clientX;

            startY =
                event.clientY;

            currentX =
                startX;

            article.classList.add(
                "swiping"
            );

            article.setPointerCapture?.(
                event.pointerId
            );
        }
    );


    article.addEventListener(
        "pointermove",
        event => {

            if (
                !tracking
            ) {

                return;
            }

            currentX =
                event.clientX;

            const deltaX =
                currentX
                -
                startX;

            const deltaY =
                event.clientY
                -
                startY;

            if (
                Math.abs(
                    deltaY
                )
                >
                Math.abs(
                    deltaX
                )
            ) {

                return;
            }

            // Only allow a swipe to the RIGHT.
            const distance =
                Math.max(
                    0,
                    Math.min(
                        deltaX,
                        110
                    )
                );

            content.style.transform =
                `translateX(${distance}px)`;

            const progress =
                Math.min(
                    distance / 70,
                    1
                );

            swipePreview.style.opacity =
                String(
                    progress
                );

            swipePreview.style.transform =
                `translateX(${
                    -8
                    +
                    progress * 8
                }px)`;
        }
    );


    const resetSwipe =
        () => {

            content.style.transform =
                "";

            swipePreview.style.opacity =
                "";

            swipePreview.style.transform =
                "";
        };


    const finishSwipe =
        event => {

            if (
                !tracking
            ) {

                return;
            }

            tracking =
                false;

            article.classList.remove(
                "swiping"
            );

            article.releasePointerCapture?.(
                event.pointerId
            );

            const deltaX =
                currentX
                -
                startX;

            resetSwipe();

            if (
                deltaX >= 65
            ) {

                openEntryActions(
                    entry
                );
            }
        };


    article.addEventListener(
        "pointerup",
        finishSwipe
    );


    article.addEventListener(
        "pointercancel",
        event => {

            tracking =
                false;

            article.classList.remove(
                "swiping"
            );

            resetSwipe();

            article.releasePointerCapture?.(
                event.pointerId
            );
        }
    );
}

// =========================
// ACTION SHEET
// =========================

function openEntryActions(
    entry
) {

    actionEntry =
        entry;

    actionsEntryName.textContent =
        entry.name;

    entryActionsDialog.showModal();
}


function closeEntryActions() {

    actionEntry =
        null;

    if (
        entryActionsDialog.open
    ) {

        entryActionsDialog.close();
    }
}


editEntryButton.addEventListener(
    "click",
    () => {

        if (
            !actionEntry
        ) {

            return;
        }

        const entryToEdit =
            actionEntry;

        closeEntryActions();

        openEditEntryDialog(
            entryToEdit
        );
    }
);


deleteEntryButton.addEventListener(
    "click",
    async () => {

        if (
            !actionEntry
        ) {

            return;
        }

        const entryToDelete =
            actionEntry;

        deleteEntryButton.disabled =
            true;

        await deleteEntry(
            entryToDelete
        );

        deleteEntryButton.disabled =
            false;

        closeEntryActions();
    }
);


cancelEntryActionsButton.addEventListener(
    "click",
    closeEntryActions
);


// =========================
// FORM CHOICE BUTTONS
// =========================

function selectChoice(
    hiddenInput,
    buttons,
    value
) {

    hiddenInput.value =
        value;

    buttons.forEach(
        button => {

            const selected =
                button.dataset.value
                ===
                value;

            button.classList.toggle(
                "selected",
                selected
            );

            button.setAttribute(
                "aria-pressed",
                String(
                    selected
                )
            );
        }
    );
}


function buildSubjectButtons() {

    subjectOptions.innerHTML =
        "";

    Object.keys(
        subjectColors
    )
        .forEach(
            subject => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.classList.add(
                    "choice-button",
                    "subject-choice"
                );

                button.dataset.value =
                    subject;

                button.style.setProperty(
                    "--choice-color",
                    subjectColors[
                        subject
                    ]
                );

                const icon =
                    document.createElement(
                        "img"
                    );

                icon.src =
                    subjectIcons[
                        subject
                    ]
                    ||
                    "";

                icon.alt =
                    "";

                icon.addEventListener(
                    "error",
                    () => {

                        icon.style.display =
                            "none";
                    }
                );

                const text =
                    document.createElement(
                        "span"
                    );

                text.textContent =
                    subject;

                button.appendChild(
                    icon
                );

                button.appendChild(
                    text
                );

                button.addEventListener(
                    "click",
                    () => {

                        selectChoice(
                            entrySubjectInput,
                            [
                                ...subjectOptions
                                    .querySelectorAll(
                                        ".subject-choice"
                                    )
                            ],
                            subject
                        );
                    }
                );

                subjectOptions.appendChild(
                    button
                );
            }
        );
}


typeOptions
    .querySelectorAll(
        ".type-choice"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectChoice(
                        entryTypeInput,
                        [
                            ...typeOptions
                                .querySelectorAll(
                                    ".type-choice"
                                )
                        ],
                        button.dataset.value
                    );
                }
            );
        }
    );


// =========================
// NO DUE DATE
// =========================

function setNoDueDate(
    selected
) {

    noDueDateSelected =
        selected;

    noDueDateButton.classList.toggle(
        "selected",
        selected
    );

    noDueDateButton.setAttribute(
        "aria-pressed",
        String(
            selected
        )
    );

    entryDueDateInput.disabled =
        selected;

    if (
        selected
    ) {

        entryDueDateInput.value =
            "";
    }
}


noDueDateButton.addEventListener(
    "click",
    () => {

        setNoDueDate(
            !noDueDateSelected
        );
    }
);


entryDueDateInput.addEventListener(
    "change",
    () => {

        if (
            entryDueDateInput.value
        ) {

            setNoDueDate(
                false
            );
        }
    }
);


// =========================
// ADD / EDIT DIALOG
// =========================

function getFirstSubject() {

    return Object.keys(
        subjectColors
    )[0];
}


function resetEntryForm() {

    editingEntryId =
        null;

    newEntryForm.reset();

    entryDialogTitle.textContent =
        "New Entry";

    saveEntryButtonText.textContent =
        "Add Entry";

    selectChoice(
        entrySubjectInput,
        [
            ...subjectOptions
                .querySelectorAll(
                    ".subject-choice"
                )
        ],
        getFirstSubject()
    );

    selectChoice(
        entryTypeInput,
        [
            ...typeOptions
                .querySelectorAll(
                    ".type-choice"
                )
        ],
        "assignment"
    );

    setNoDueDate(
        false
    );

    entryDueDateInput.min =
        getTodayForInput();
}


function openNewEntryDialog() {

    resetEntryForm();

    newEntryDialog.showModal();

    setTimeout(
        () => {

            entryNameInput.focus();
        },
        0
    );
}


function openEditEntryDialog(
    entry
) {

    editingEntryId =
        entry.id;

    // Existing entries can have past dates,
    // so don't apply the "today" minimum while editing.
    entryDueDateInput.removeAttribute(
        "min"
    );

    entryDialogTitle.textContent =
        "Edit Entry";

    saveEntryButtonText.textContent =
        "Save Changes";

    entryNameInput.value =
        entry.name;

    selectChoice(
        entrySubjectInput,
        [
            ...subjectOptions
                .querySelectorAll(
                    ".subject-choice"
                )
        ],
        entry.subject
    );

    selectChoice(
        entryTypeInput,
        [
            ...typeOptions
                .querySelectorAll(
                    ".type-choice"
                )
        ],
        entry.type
    );

    if (
        entry.dueDate
    ) {

        setNoDueDate(
            false
        );

        entryDueDateInput.value =
            entry.dueDate;

    } else {

        setNoDueDate(
            true
        );
    }

    newEntryDialog.showModal();

    setTimeout(
        () => {

            entryNameInput.focus();

            entryNameInput.select();
        },
        0
    );
}


newEntryButton.addEventListener(
    "click",
    openNewEntryDialog
);


closeEntryButton.addEventListener(
    "click",
    () => {

        if (
            !saveEntryButton.disabled
        ) {

            newEntryDialog.close();
        }
    }
);


// =========================
// FORM LOADING STATE
// =========================

function setFormLoading(
    loading
) {

    saveEntryButton.disabled =
        loading;

    saveEntryButton.classList.toggle(
        "loading",
        loading
    );

    if (
        loading
    ) {

        saveEntryButtonText.textContent =
            editingEntryId
                ?
                "Saving…"
                :
                "Adding…";

    } else {

        saveEntryButtonText.textContent =
            editingEntryId
                ?
                "Save Changes"
                :
                "Add Entry";
    }
}


// =========================
// SUBMIT FORM
// =========================

newEntryForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const name =
            entryNameInput
                .value
                .trim();

        const subject =
            entrySubjectInput
                .value;

        const type =
            entryTypeInput
                .value;

        const dueDate =
            noDueDateSelected
                ?
                null
                :
                (
                    entryDueDateInput.value
                    ||
                    null
                );

        if (
            !name
            ||
            !subject
            ||
            !type
        ) {

            return;
        }

        setFormLoading(
            true
        );

        const entryData = {
            name,
            subject,
            type,
            dueDate
        };

        let success =
            false;

        if (
            editingEntryId
        ) {

            const existingEntry =
                entries.find(
                    entry =>
                        Number(
                            entry.id
                        )
                        ===
                        Number(
                            editingEntryId
                        )
                );

            if (
                existingEntry
            ) {

                success =
                    await updateEntryInDatabase(
                        existingEntry,
                        entryData
                    );
            }

        } else {

            success =
                await addEntryToDatabase(
                    entryData
                );
        }

        setFormLoading(
            false
        );

        if (
            success
        ) {

            newEntryDialog.close();

            resetEntryForm();
        }
    }
);


// =========================
// CLEAR COMPLETED
// =========================

clearCompletedButton.addEventListener(
    "click",
    clearCompletedAssignments
);


// =========================
// TODAY FOR INPUT
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
// OLD LOCALSTORAGE MIGRATION
// =========================

async function migrateOldEntries() {

    const oldSavedEntries =
        localStorage.getItem(
            "plannerEntries"
        );

    if (
        !oldSavedEntries
    ) {

        return;
    }

    let oldEntries;

    try {

        oldEntries =
            JSON.parse(
                oldSavedEntries
            );

    } catch (
        error
    ) {

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
        error:
            countError
    } =
        await supabaseClient
            .from(
                "entries"
            )
            .select(
                "*",
                {
                    count:
                        "exact",

                    head:
                        true
                }
            );

    if (
        countError
        ||
        count > 0
    ) {

        return;
    }

    const entriesToUpload =
        oldEntries.map(
            (
                entry,
                index
            ) => ({
                name:
                    entry.name,

                subject:
                    entry.subject,

                type:
                    entry.type,

                due_date:
                    entry.dueDate
                    ||
                    null,

                completed:
                    entry.completed
                    ??
                    false,

                sort_order:
                    index
            })
        );

    const {
        error
    } =
        await supabaseClient
            .from(
                "entries"
            )
            .insert(
                entriesToUpload
            );

    if (
        error
    ) {

        console.error(
            "Could not migrate old entries:",
            error
        );

        return;
    }

    localStorage.removeItem(
        "plannerEntries"
    );
}


// =========================
// START APP
// =========================

async function startApp() {

    showGreeting();

    showCurrentDate();

    buildSubjectButtons();

    resetEntryForm();

    await migrateOldEntries();

    await loadEntries();

    subscribeToEntryChanges();

    hideLoadingScreen();
}


startApp();
