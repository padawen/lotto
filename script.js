let tickets = [];

const ticketsList = document.getElementById('tickets-list');
const inputs = document.querySelectorAll('.winning-input');
const clearBtn = document.getElementById('clear-btn');

// Load tickets from JSON file
async function loadTickets() {
    try {
        const response = await fetch('tickets.json');
        const data = await response.json();
        tickets = data.tickets;
        renderTickets();
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

function renderTickets() {
    const winningNumbers = Array.from(inputs)
        .map(input => parseInt(input.value))
        .filter(num => !isNaN(num));

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

        // Add match-specific class for celebration effects
        if (matchCount >= 2) {
            ticketRow.classList.add(`match-${matchCount}`);
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
        statusDiv.className = `match-count ${matchCount > 1 ? 'winner' : ''}`;
        statusDiv.textContent = `${matchCount} találat`;

        ticketRow.appendChild(numbersDiv);
        ticketRow.appendChild(statusDiv);
        ticketsList.appendChild(ticketRow);
    });
}

// Event listeners for inputs
inputs.forEach(input => {
    input.addEventListener('input', () => {
        // Simple validation and focus management
        if (input.value.length >= 2) {
            const next = input.nextElementSibling;
            if (next && next.classList.contains('winning-input')) {
                next.focus();
            }
        }
        renderTickets();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value) {
            const prev = input.previousElementSibling;
            if (prev && prev.classList.contains('winning-input')) {
                prev.focus();
            }
        }
    });
});

clearBtn.addEventListener('click', () => {
    inputs.forEach(input => input.value = '');
    inputs[0].focus();
    renderTickets();
});

// Initial load and render
loadTickets();
