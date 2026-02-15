let tickets = [];
let currentLottoType = 5; // 5 or 6

const ticketsList = document.getElementById('tickets-list');
const clearBtn = document.getElementById('clear-btn');
const inputContainer = document.getElementById('input-container');
const lotto5Btn = document.getElementById('lotto-5-btn');
const lotto6Btn = document.getElementById('lotto-6-btn');

// Initialize inputs based on type
function createInputs() {
    inputContainer.innerHTML = '';
    const count = currentLottoType;
    for (let i = 1; i <= count; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'winning-input';
        input.min = '1';
        input.max = currentLottoType === 5 ? '90' : '45';
        input.placeholder = i.toString();
        input.inputMode = 'numeric';

        input.addEventListener('input', () => {
            // Strip non-numeric characters
            input.value = input.value.replace(/[^0-9]/g, '');

            if (input.value.length >= 2) {
                const next = input.nextElementSibling;
                if (next && next.classList.contains('winning-input')) {
                    next.focus();
                }
            }
            renderTickets();
        });

        input.addEventListener('keydown', (e) => {
            // Only allow numbers and navigation keys
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Enter'];
            if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
                // We let the 'input' event handle characters that might slip through
            }

            if (e.key === 'Backspace' && !input.value) {
                const prev = input.previousElementSibling;
                if (prev && prev.classList.contains('winning-input')) {
                    prev.focus();
                }
            }
        });

        inputContainer.appendChild(input);
    }
}

// Load tickets from JSON file
async function loadTickets() {
    try {
        const fileName = currentLottoType === 5 ? 'tickets_5.json' : 'tickets_6.json';
        const response = await fetch(fileName);
        const data = await response.json();
        tickets = data.tickets;
        renderTickets();
    } catch (error) {
        console.error('Error loading tickets:', error);
        ticketsList.innerHTML = `<p style="text-align:center; color:var(--text-secondary)">Hiba a jegyek betöltésekor: ${fileName}</p>`;
    }
}

function renderTickets() {
    const inputs = document.querySelectorAll('.winning-input');
    const winningNumbers = Array.from(inputs)
        .map(input => parseInt(input.value))
        .filter(num => !isNaN(num));

    const threshold = currentLottoType === 5 ? 2 : 3;

    // Calculate matches for all tickets first to enable sorting
    const ticketsWithMatches = tickets.map((ticket, originalIndex) => {
        const matches = ticket.filter(num => winningNumbers.includes(num));
        return {
            ticket,
            matchCount: matches.length,
            originalIndex
        };
    });

    // Sort: highest match count first, preserve original order for ties
    ticketsWithMatches.sort((a, b) => {
        if (b.matchCount !== a.matchCount) {
            return b.matchCount - a.matchCount;
        }
        return a.originalIndex - b.originalIndex;
    });

    ticketsList.innerHTML = '';

    ticketsWithMatches.forEach((item, index) => {
        const { ticket, matchCount } = item;

        // Sort numbers within the ticket: hits to the left, then rest, both ascending
        const displayNumbers = [...ticket].sort((a, b) => {
            const aMatch = winningNumbers.includes(a);
            const bMatch = winningNumbers.includes(b);
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return a - b;
        });

        const ticketRow = document.createElement('div');
        ticketRow.className = 'ticket-row';
        ticketRow.style.animationDelay = `${index * 0.05}s`;

        // Celebration class mapping
        // 5os: 2 -> match-2, 3 -> match-3, 4 -> match-4, 5 -> match-5
        // 6os: 3 -> match-2, 4 -> match-3, 5 -> match-4, 6 -> match-5 (or match-6)
        if (matchCount >= threshold) {
            let celebrationLevel = matchCount;
            if (currentLottoType === 6) {
                celebrationLevel = matchCount - 1; // 3 matches in 6os becomes match-2 intensity
            }
            ticketRow.classList.add(`match-${celebrationLevel}`);
        }

        const numbersDiv = document.createElement('div');
        numbersDiv.className = 'ticket-numbers';

        displayNumbers.forEach(num => {
            const ball = document.createElement('div');
            ball.className = `number-ball ${winningNumbers.includes(num) ? 'match' : ''}`;
            ball.textContent = num;
            numbersDiv.appendChild(ball);
        });

        const statusDiv = document.createElement('div');
        statusDiv.className = `match-count ${matchCount >= threshold ? 'winner' : ''}`;
        statusDiv.textContent = `${matchCount} találat`;

        ticketRow.appendChild(numbersDiv);
        ticketRow.appendChild(statusDiv);
        ticketsList.appendChild(ticketRow);
    });
}

function switchLottoType(type) {
    if (currentLottoType === type) return;

    currentLottoType = type;

    // UI update
    lotto5Btn.classList.toggle('active', type === 5);
    lotto6Btn.classList.toggle('active', type === 6);

    createInputs();
    loadTickets();
}

lotto5Btn.addEventListener('click', () => switchLottoType(5));
lotto6Btn.addEventListener('click', () => switchLottoType(6));

clearBtn.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.winning-input');
    inputs.forEach(input => input.value = '');
    if (inputs.length > 0) inputs[0].focus();
    renderTickets();
});

// Initial load
createInputs();
loadTickets();
