const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');
const uploadInput = document.getElementById('map-upload');
const calculateBtn = document.getElementById('calculate-btn');
const pointsTable = document.getElementById('points-table').querySelector('tbody');

canvas.width = 800;
canvas.height = 600;

const points = [];
const connections = [];
let selectedPoint = null;

// Handle map upload
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = URL.createObjectURL(file);
    }
});

// Add points on click
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const value = parseInt(prompt('Enter point value (1, 2, or 3):'));
    const guild = prompt('Enter guild name:');

    if (value && [1, 2, 3].includes(value) && guild) {
        const point = { x, y, value, guild, id: points.length };
        points.push(point);
        drawPoint(point);
    }
});

function drawPoint({ x, y, value, guild }) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fillText(value, x - 4, y + 4);
    ctx.fillStyle = 'black';
    ctx.fillText(guild[0].toUpperCase(), x - 4, y + 18);
}

// Connect points on right-click
canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedPoint = points.find(
        (point) => Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2) < 10
    );

    if (clickedPoint) {
        if (!selectedPoint) {
            selectedPoint = clickedPoint;
            highlightPoint(clickedPoint, 'blue');
        } else {
            connections.push({ from: selectedPoint, to: clickedPoint });
            drawLine(selectedPoint, clickedPoint);
            highlightPoint(selectedPoint, 'red');
            selectedPoint = null;
        }
    }
});

function drawLine(point1, point2) {
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.strokeStyle = 'blue';
    ctx.stroke();
}

function highlightPoint({ x, y }, color) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.stroke();
}

// Calculate total points and update table
calculateBtn.addEventListener('click', () => {
    const guildScores = {};

    points.forEach((point) => {
        if (!guildScores[point.guild]) {
            guildScores[point.guild] = { total: 0, connections: [] };
        }
        guildScores[point.guild].total += point.value;
    });

    connections.forEach(({ from, to }) => {
        guildScores[from.guild].connections.push(`Point ${from.id} → Point ${to.id}`);
    });

    updateTable(guildScores);
});

function updateTable(guildScores) {
    pointsTable.innerHTML = '';

    Object.keys(guildScores).forEach((guild) => {
        const row = document.createElement('tr');
        const { total, connections } = guildScores[guild];

        row.innerHTML = `
            <td>${guild}</td>
            <td>${total}</td>
            <td>${connections.join(', ')}</td>
        `;

        pointsTable.appendChild(row);
    });
}
