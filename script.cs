const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');
const uploadInput = document.getElementById('map-upload');
const tableBody = document.querySelector('#points-table tbody');

let points = [];
let connections = [];

// Set canvas size dynamically
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Handle map upload
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const img = new Image();
        img.onload = () => {
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
    if (pointValue && ['1', '2', '3'].includes(pointValue)) {
        points.push({ x, y, value: parseInt(pointValue) });
        drawPoint(x, y, pointValue);
    }
});

function drawPoint(x, y, value) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fillText(value, x - 5, y + 5);
}

// Draw connections
canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const lastPoint = points[points.length - 1];
    if (lastPoint) {
        connections.push({ from: lastPoint, to: { x, y } });
        drawLine(lastPoint.x, lastPoint.y, x, y);
    }
});

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'blue';
    ctx.stroke();
}

// Generate table
function generateTable() {
    tableBody.innerHTML = '';
    for (let day = 1; day <= 6; day++) {
        const totalPoints = points.reduce((sum, point) => sum + point.value, 0);
        tableBody.innerHTML += `
            <tr>
                <td>Day ${day}</td>
                <td>${totalPoints}</td>
                <td>Optimized path TBD</td>
            </tr>
        `;
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        generateTable();
    }
});
