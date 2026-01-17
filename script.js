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

    ticketsList.innerHTML = '';

    tickets.forEach((ticket, index) => {
        const matches = ticket.filter(num => winningNumbers.includes(num));
        const matchCount = matches.length;

        const ticketRow = document.createElement('div');
        ticketRow.className = 'ticket-row';
        ticketRow.style.animationDelay = `${index * 0.05}s`;

        const numbersDiv = document.createElement('div');
        numbersDiv.className = 'ticket-numbers';

        ticket.forEach(num => {
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
