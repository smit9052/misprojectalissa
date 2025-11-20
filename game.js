document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let gameState = 'start'; // 'start', 'playing', 'gameOver'
    let score = 0;
    let gameSpeed = 5; // Game speed (Issue 1 fix)
    let cameraX = 0;

    // Player object (Fish)
    const player = {
        x: 100,
        y: 300,
        width: 30,
        height: 30,
        velocityY: 0,
        isJumping: false,
        canDoubleJump: true,
        canTripleJump: true,
        color: '#ff6b6b'
    };

    // Game objects
    let obstacles = [];
    let particles = [];
    let backgroundObjects = [];
    let birdPredators = []; 

    // Physics constants
    const GRAVITY = 0.5;
    const JUMP_FORCE = -13;
    const GROUND_Y = 350;

    // Initialize background objects - Only Clouds remain in the sky
    function initBackground() {
        backgroundObjects = [];
        
        // Add clouds (The only remaining permanent sky object, per request)
        for (let i = 0; i < 5; i++) {
             backgroundObjects.push({
                x: i * 200 + Math.random() * 100,
                y: Math.random() * 80 + 20,
                width: Math.random() * 50 + 100,
                height: Math.random() * 10 + 20,
                type: 'cloud',
                color: '#FFFFFF'
            });
        }
        // Removed 'ship' and 'lighthouse' background objects from the sky.
    }

    // Create obstacle - Duluth harbor themed (Only water-based, collidable obstacles)
    function createObstacle() {
        const types = ['boat', 'sailboat', 'buoy', 'tugboat', 'fishing_boat'];
        const type = types[Math.floor(Math.random() * types.length)];

        let obstacle = {
            x: canvas.width + 100,
            y: GROUND_Y,
            width: 40,
            height: 50,
            type: type,
            color: '#2c3e50',
            isMoving: false,
            moveSpeed: 0,
            moveDirection: 1
        };

        if (type === 'boat') {
            obstacle.width = 120; // Wider for a cargo ship look
            obstacle.height = 30; 
            obstacle.y = GROUND_Y + 10;
            obstacle.color = '#464a4d'; // Dark gray/steel
            obstacle.isMoving = Math.random() < 0.3;
            obstacle.moveSpeed = 0.5;
        } else if (type === 'sailboat') {
            obstacle.width = 60;
            obstacle.height = 20;
            obstacle.y = GROUND_Y + 20;
            obstacle.color = '#8b4513';
            obstacle.isMoving = Math.random() < 0.4;
            obstacle.moveSpeed = 0.3;
        } else if (type === 'buoy') {
            obstacle.width = 20;
            obstacle.height = 30;
            obstacle.y = GROUND_Y + 10;
            obstacle.color = '#ff6b6b';
            obstacle.isMoving = Math.random() < 0.2;
            obstacle.moveSpeed = 0.2;
        } else if (type === 'tugboat') {
            obstacle.width = 70;
            obstacle.height = 20;
            obstacle.y = GROUND_Y + 18;
            obstacle.color = '#FF5733'; // Orange-Red
            obstacle.isMoving = Math.random() < 0.4;
            obstacle.moveSpeed = 0.4;
        } else if (type === 'fishing_boat') {
            obstacle.width = 90;
            obstacle.height = 22;
            obstacle.y = GROUND_Y + 16;
            obstacle.color = '#0000FF';
            obstacle.isMoving = Math.random() < 0.3;
            obstacle.moveSpeed = 0.3;
        }

        obstacles.push(obstacle);
    }

    // Create Bird Predator (Issue 6 fix)
    function createBirdPredator() {
        birdPredators.push({
            x: canvas.width + 100,
            y: Math.random() * 100 + 50, // High in the sky
            width: 40,
            height: 20,
            color: '#694017', 
            wingAngle: 0, 
            wingSpeed: 0.2, 
            verticalDirection: Math.random() < 0.5 ? 1 : -1, 
            verticalSpeed: Math.random() * 0.5 + 0.5 
        });
    }

    // ... (Particle functions remain the same) ...
    function createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: x,
                y: y,
                velocityX: (Math.random() - 0.5) * 10,
                velocityY: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }

    // Jump function (Triple Jump fix included)
    function jump() {
        if (gameState !== 'playing') return;

        if (!player.isJumping) {
            player.velocityY = JUMP_FORCE;
            player.isJumping = true;
            player.canDoubleJump = true;
            player.canTripleJump = true;
        } else if (player.canDoubleJump && player.velocityY > -3) {
            player.velocityY = JUMP_FORCE * 0.9;
            player.canDoubleJump = false;
        } else if (player.canTripleJump && player.velocityY > -1) {
            player.velocityY = JUMP_FORCE * 0.8;
            player.canTripleJump = false;
        }
    }

    // ... (Update functions for Player, Obstacles, Birds, Particles, Collisions, Game State) ...
    function updatePlayer() {
        if (gameState !== 'playing') return;

        player.velocityY += GRAVITY;
        player.y += player.velocityY;

        if (player.y >= GROUND_Y) {
            player.y = GROUND_Y;
            player.velocityY = 0;
            player.isJumping = false;
            player.canDoubleJump = true; 
            player.canTripleJump = true; 
        }
    }

    function updateObstacles() {
        if (gameState !== 'playing') return;

        obstacles.forEach(obstacle => {
            obstacle.x -= gameSpeed;

            if (obstacle.isMoving) {
                obstacle.y += obstacle.moveSpeed * obstacle.moveDirection;

                if (obstacle.y >= GROUND_Y + 25 || obstacle.y <= GROUND_Y - 5) {
                    obstacle.moveDirection *= -1;
                }
            }
        });

        const obstaclesBefore = obstacles.length;
        obstacles = obstacles.filter(obstacle => obstacle.x > -obstacle.width);
        const obstaclesAfter = obstacles.length;

        if (obstaclesBefore > obstaclesAfter) {
            score += 10;
        }

        if (Math.random() < 0.015) {
            createObstacle();
        }

        gameSpeed += 0.001;
    }

    function updateBirdPredators() {
        if (gameState !== 'playing') return;

        birdPredators.forEach(bird => {
            bird.x -= gameSpeed * 1.5; 
            bird.y += bird.verticalSpeed * bird.verticalDirection;

            bird.wingAngle = Math.sin(Date.now() * bird.wingSpeed) * 0.5;

            if (bird.y <= 50 || bird.y >= 150) {
                bird.verticalDirection *= -1;
            }
        });

        birdPredators = birdPredators.filter(bird => bird.x > -bird.width * 2);

        if (Math.random() < 0.008) {
            createBirdPredator();
        }
    }

    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.3; 
            particle.life--;
        });

        particles = particles.filter(particle => particle.life > 0);
    }

    function checkCollisions() {
        obstacles.forEach(obstacle => {
            if (player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y) {
                gameOver();
            }
        });

        birdPredators.forEach(bird => {
            if (player.x < bird.x + bird.width &&
                player.x + player.width > bird.x &&
                player.y < bird.y + bird.height &&
                player.y + player.height > bird.y) {
                gameOver();
            }
        });
    }

    function gameOver() {
        gameState = 'gameOver';
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('finalScore').textContent = Math.floor(score); 
        createParticles(player.x + player.width/2, player.y + player.height/2, player.color);
    }

    function startGame() {
        gameState = 'playing';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('instructions').style.display = 'block';

        setTimeout(() => {
            document.getElementById('instructions').style.display = 'none';
        }, 3000);

        resetGame();
    }

    function restartGame() {
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('startScreen').style.display = 'block';
        document.getElementById('instructions').style.display = 'none';
        resetGame();
    }

    function resetGame() {
        score = 0;
        gameSpeed = 5; 
        cameraX = 0;
        player.x = 100;
        player.y = 300;
        player.velocityY = 0;
        player.isJumping = false;
        player.canDoubleJump = true;
        player.canTripleJump = true;
        obstacles = [];
        particles = [];
        birdPredators = [];
        initBackground();
    }

    // Draw functions
    function drawBackground() {
        // Duluth harbor sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB'); 
        gradient.addColorStop(0.3, '#B0E0E6'); 
        gradient.addColorStop(0.7, '#4682B4'); 
        gradient.addColorStop(1, '#2F4F4F'); 
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Background objects - Only Clouds remain
        backgroundObjects.forEach(obj => {
            const parallaxSpeed = 0.1; // Only clouds remain, simplified parallax speed
            const objX = obj.x - cameraX * parallaxSpeed;

            if (obj.type === 'cloud') {
                 // Draw simple, soft cloud shapes
                ctx.fillStyle = obj.color;
                ctx.beginPath();
                ctx.arc(objX, obj.y, obj.width / 4, 0, 2 * Math.PI);
                ctx.arc(objX + obj.width / 4, obj.y - 10, obj.width / 4, 0, 2 * Math.PI);
                ctx.arc(objX + obj.width / 2, obj.y, obj.width / 4, 0, 2 * Math.PI);
                ctx.fill();
            }
            // Ships and Lighthouse drawing removed to clear the sky.
        });

        // Water surface
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

        // Water waves 
        ctx.strokeStyle = '#5F9EA0';
        ctx.lineWidth = 2;
        for (let i = 0; i < canvas.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, GROUND_Y + Math.sin((i + cameraX * 0.3) * 0.1) * 5); 
            ctx.lineTo(i + 20, GROUND_Y + Math.sin((i + 20 + cameraX * 0.3) * 0.1) * 5);
            ctx.stroke();
        }
    }

    // ... (drawPlayer and drawBird functions remain the same) ...
    function drawPlayer() {
        // Draw fish character
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.ellipse(player.x + player.width/2, player.y + player.height/2, player.width/2, player.height/2, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Fish tail
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y + player.height/2);
        ctx.lineTo(player.x - 15, player.y + 5);
        ctx.lineTo(player.x - 15, player.y + player.height - 5);
        ctx.closePath();
        ctx.fill();

        // Fish eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(player.x + player.width/2 + 5, player.y + player.height/2 - 5, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(player.x + player.width/2 + 7, player.y + player.height/2 - 3, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    function drawBird(bird) {
        ctx.save();
        ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        ctx.fillStyle = bird.color;

        // Draw body (Simple oval)
        ctx.beginPath();
        ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Draw beak
        ctx.fillStyle = '#ffd700'; 
        ctx.beginPath();
        ctx.moveTo(bird.width / 2, 0);
        ctx.lineTo(bird.width / 2 + 5, -3);
        ctx.lineTo(bird.width / 2, 3);
        ctx.closePath();
        ctx.fill();

        // Draw wings (Flapping animation)
        ctx.fillStyle = bird.color;

        // Right wing
        ctx.save();
        ctx.rotate(-bird.wingAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, -20);
        ctx.lineTo(40, -10);
        ctx.lineTo(20, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Left wing
        ctx.save();
        ctx.rotate(bird.wingAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, 20);
        ctx.lineTo(40, 10);
        ctx.lineTo(20, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    // NEW & IMPROVED: Draw Realistic Obstacles
    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;

            if (obstacle.type === 'boat') {
                // Draw CARGO SHIP Obstacle Hull (More realistic than a box)
                const hullColor = obstacle.color; 
                const deckColor = '#607d8b'; // Blue-gray deck

                // Hull (submerged part)
                ctx.fillStyle = hullColor;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

                // Waterline Stripe
                ctx.fillStyle = '#a94442'; // Rust red
                ctx.fillRect(obstacle.x, obstacle.y + obstacle.height * 0.8, obstacle.width, obstacle.height * 0.2);

                // Deck
                ctx.fillStyle = deckColor;
                ctx.fillRect(obstacle.x, obstacle.y - 5, obstacle.width, 5);
                
                // Superstructure/Cabin (near the stern)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(obstacle.x + obstacle.width - 30, obstacle.y - 15, 25, 10);
                

            } else if (obstacle.type === 'sailboat') {
                // Draw realistic SAILBOAT
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                // Hull shape (sharper front)
                ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
                ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
                ctx.lineTo(obstacle.x + obstacle.width * 0.9, obstacle.y);
                ctx.lineTo(obstacle.x + obstacle.width * 0.1, obstacle.y);
                ctx.closePath();
                ctx.fill();

                // Mast
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(obstacle.x + obstacle.width / 2 - 1, obstacle.y - 50, 2, 50);

                // Main Sail (white triangular sail)
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y - 50);
                ctx.lineTo(obstacle.x + obstacle.width * 0.9, obstacle.y - 5);
                ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y - 5); 
                ctx.closePath();
                ctx.fill();

            } else if (obstacle.type === 'buoy') {
                // Draw buoy
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(obstacle.x + 2, obstacle.y + obstacle.height / 2 - 3, obstacle.width - 4, 6);

            } else if (obstacle.type === 'tugboat') {
                // Draw realistic TUG BOAT
                const tugColor = obstacle.color; // Orange-Red
                const cabinColor = '#FFC300'; // Yellow Cabin

                // Hull
                ctx.fillStyle = tugColor;
                ctx.beginPath();
                ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
                ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
                ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
                ctx.lineTo(obstacle.x, obstacle.y);
                ctx.closePath();
                ctx.fill();

                // Deck
                ctx.fillStyle = '#333';
                ctx.fillRect(obstacle.x, obstacle.y - 5, obstacle.width, 5);
                
                // Cabin/Bridge (Taller and set back)
                ctx.fillStyle = cabinColor;
                ctx.fillRect(obstacle.x + 15, obstacle.y - 35, obstacle.width - 30, 30);
                
                // Smokestack
                ctx.fillStyle = '#333';
                ctx.fillRect(obstacle.x + obstacle.width - 20, obstacle.y - 45, 10, 10);

            } else if (obstacle.type === 'fishing_boat') {
                // Draw fishing boat
                ctx.fillStyle = obstacle.color;
                ctx.beginPath();
                // Hull (slightly curved bow/stern)
                ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
                ctx.quadraticCurveTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height + 5, obstacle.x + obstacle.width, obstacle.y + obstacle.height);
                ctx.lineTo(obstacle.x + obstacle.width, obstacle.y - 5);
                ctx.lineTo(obstacle.x, obstacle.y - 5);
                ctx.closePath();
                ctx.fill();

                // Deck
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(obstacle.x, obstacle.y - 5, obstacle.width, 5);

                // Cabin
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(obstacle.x + 10, obstacle.y - 15, obstacle.width - 20, 10);
            }
        });
    }

    function drawParticles() {
        particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
        ctx.globalAlpha = 1;
    }

    function drawUI() {
        // Score
        document.getElementById('score').textContent = `Score: ${Math.floor(score)}`;
    }

    // Main game loop
    function gameLoop() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        drawBackground();

        if (gameState === 'playing') {
            // Update game objects
            updatePlayer();
            updateObstacles();
            updateBirdPredators(); 
            updateParticles();
            checkCollisions();

            // Update camera
            cameraX += gameSpeed;
        }

        // Draw game objects
        drawPlayer();
        drawObstacles();
        birdPredators.forEach(drawBird); 
        drawParticles();
        drawUI();

        // Continue game loop
        requestAnimationFrame(gameLoop);
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });

    canvas.addEventListener('click', () => {
        jump();
    });

    window.startGame = startGame;
    window.restartGame = restartGame;

    // Initialize game
    initBackground();
    gameLoop();

});