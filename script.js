const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');
const uploadInput = document.getElementById('map-upload');
const calculateBtn = document.getElementById('calculate-btn');
const pointsTable = document.getElementById('points-table').querySelector('tbody');

const points = [];
const connections = [];
let selectedPoint = null;

// Set canvas dimensions
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Handle map upload
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
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

    const pointValue = prompt('Enter point value (1, 2, or 3):');
    const guildName = prompt('Enter guild name:');
    if (pointValue && ['1', '2', '3'].includes(pointValue) && guildName) {
        const point = { x, y, value: parseInt(pointValue), guild: guildName, id: points.length };
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
    ctx.fillText(value, x - 5, y + 5); // Show point value
    ctx.fillStyle = 'black';
    ctx.fillText(guild[0].toUpperCase(), x - 5, y + 20); // Show guild initial
}

// Connect points on right-click
canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedPoint = findNearestPoint(x, y);

    if (clickedPoint) {
        if (!selectedPoint) {
            // First point selected
            selectedPoint = clickedPoint;
            highlightPoint(clickedPoint, 'blue');
        } else {
            // Second point selected, connect them
            drawLine(selectedPoint, clickedPoint);
            connections.push({ from: selectedPoint, to: clickedPoint });
            highlightPoint(selectedPoint, 'red'); // Reset previous point
            selectedPoint = null;
        }
    }
});

function findNearestPoint(x, y) {
    return points.find(
        (point) => Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2) < 15
    );
}

function highlightPoint({ x, y }, color) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawLine(point1, point2) {
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.strokeStyle = 'blue';
    ctx.stroke();
}

// Calculate total points and optimize path
calculateBtn.addEventListener('click', () => {
    const dayResults = [];

    // Group connections by guild
    const guildConnections = points.reduce((acc, point) => {
        acc[point.guild] = acc[point.guild] || [];
        acc[point.guild].push(point);
        return acc;
    }, {});

    Object.keys(guildConnections).forEach((guild, index) => {
        const guildPoints = guildConnections[guild];
        const totalPoints = guildPoints.reduce((sum, point) => sum + point.value, 0);
        const path = guildPoints.map((p) => `Point ${p.id}`).join(' → ');

        dayResults.push({ day: index + 1, guild, totalPoints, path });
    });

    updateTable(dayResults);
});

function updateTable(results) {
    pointsTable.innerHTML = ''; // Clear table

    results.forEach(({ day, guild, totalPoints, path }) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Day ${day}</td>
            <td>${totalPoints} (Guild: ${guild})</td>
            <td>${path}</td>
        `;
        pointsTable.appendChild(row);
    });
}
