kaboom({
    scale: 2,
    background: [0 , 0, 0],
    crisp: true,
})

//ladataan spritet
loadSprite("player", "sprites/player.png")
loadSprite("stone", "sprites/stone.png")
loadSprite("gate", "sprites/gate.png")
loadSprite("log-right", "sprites/log-right.png")
loadSprite("log-left", "sprites/log-left.png")
loadSprite("background", "sprites/background.png")

loadSound("score", "sounds/score.mp3")
loadSound("wooosh", "sounds/wooosh.mp3")
loadSound("blip", "sounds/blip.mp3")

//scene vaikeustason valitsemista varten
scene("difficulty", () => {
    const Easy_Difficulty = "easy"
    const Medium_Difficulty = "medium"
    const Hard_Difficulty = "hard"

    add([
        text("Select Difficulty"),
        pos(width() / 2, height() / 2 - 100),
        anchor("center"),
        scale(1.5),
    ])
    add([
        text("Easy (press 1)"),
        pos(width() / 2, height() / 2),
        anchor("center"),
    ])
    add([
        text("Medium (press 2)"),
        pos(width() / 2, height() / 2 + 50),
        anchor("center"),
    ])  
    add([
        text("Hard (press 3)"),
        pos(width() / 2, height() / 2 + 100),
        anchor("center"),
    ])
    onKeyPress("1", () => {
        go("main" , Easy_Difficulty)
    })
    onKeyPress("2", () => {
        go("main", Medium_Difficulty)
    })
    onKeyPress("3", () => {
        go("main", Hard_Difficulty)
    })
})

//scene pelin päättymistä varten, näyttää pisteet ja mahdollisuuden restarttiin tai vaikeustason vaihtamiseen
scene("gameover", ({ score = 0, difficulty }) => {
    add([
        text("Game Over"),
        pos(width() / 2, height() / 2),
        anchor("center"),
        scale(2),
    ])
    add([
        text("Score: " + score),
        pos(width() / 2, height() / 2 + 80),
        anchor("center"),        
        scale(1),
    ])
    add([
        text("Press Space to Restart"),
        pos(width() / 2, height() / 2 - 120),
        anchor("center"),        
        scale(0.8),
    ])
    add([
        text("Press R to Change Difficulty"),
        pos(width() / 2, height() / 2 - 85),
        anchor("center"),        
        scale(0.8),
    ])
    onKeyPress("r", () => {
        go("difficulty")
    })
    onKeyPress("space", () => {
        go("main", difficulty)
        console.log(difficulty)
    })
})

//itse peli
scene("main", (difficulty) => {
    const SCALE_X = 6
    const SCALE_Y = 4
    const TILE_W = 57 * SCALE_X
    const TILE_H = 63 * SCALE_Y
    const MOVE_SPEED = 150
    let SCORE = 0

    let SPEED = 0

    if (difficulty === "easy") {
        SPEED = 100
    }
    else if (difficulty === "medium") {
        SPEED = 125
    }
    else if (difficulty === "hard") {
        SPEED = 150
    }

    const tilesNeeded = Math.ceil(height() / TILE_H) + 1

    const bgTest = add([
        sprite("background"),
        scale(SCALE_X, SCALE_Y),
    ])
    destroy(bgTest)

    const centerX = (width() - TILE_W) / 2
    const tasoVasen = centerX
    const tasoOikea = centerX + TILE_W


    for (let i = 0; i < tilesNeeded; i++) {
            add([
            sprite("background"),
            pos(centerX, i * TILE_H),
            scale(SCALE_X, SCALE_Y),
            z(-1),
            "bgTile",
        ])
    }
    
    add([
        rect(TILE_W, 10),
        pos(centerX, 450),
        area(),
        opacity(0,5),
        "scorer",
    ])

    const score = add([
        text("0"),
        pos(100, 50),
        scale(1),
        z(100),
        {
            value: 0
        }
    ])

    onUpdate(() => {
        get("bgTile").forEach(tile => {
            tile.move(0, SPEED)

            if (tile.pos.y >= height()) {
            tile.pos.y -= TILE_H * tilesNeeded
            }
        })

        get ("obstacle").forEach(ob => {
        ob.move(0, SPEED)

        if (ob.pos.y > player.pos.y && !ob.passed) {
            ob.passed = true
            SCORE++
            score.text = SCORE.toString()
            play("score")
            updateSpeed()
        }

        if(ob.pos.y > height() + 30){
            destroy(ob)
        }
        })
    })

    const player = add([
        sprite("player"),
        pos(centerX + TILE_W / 2, height() -50),
        anchor("center"),
        area(),
        body(),
        scale(1.8),
    ])

    onKeyDown("a", () => {
        player.move(-MOVE_SPEED, 0)
    })

    onKeyDown("d", () =>{
        player.move(MOVE_SPEED, 0)
    })

    onKeyDown("w", () =>{
        player.move(0, -MOVE_SPEED)
    })

    onKeyDown("s", () =>{
        player.move(0, MOVE_SPEED)
    })

    player.onUpdate(() => {
        player.pos.x = clamp(player.pos.x, tasoVasen + 30, tasoOikea - 30)

        if (player.pos.y > height()) {
            play("blip")
            destroy(player)
            go("gameover", { score: SCORE, difficulty })
        }
        if (player.pos.y < -70) {
            play("blip")
            destroy(player)
            go("gameover", { score: SCORE, difficulty })
        }
    })

    function spawnObstacle(){
        const type = choose(["stone", "gate", "log-right", "log-left"])
        
        const obstacle = add([
            sprite(type),
            pos(centerX, -50),
            scale(1.6),
            area(),
            body({isStatic : true}),
            anchor("center"),
            "obstacle",
        ])

        obstacle.passed = false
        const halfWidth = obstacle.width / 2
        obstacle.pos.x = rand(tasoVasen + halfWidth, tasoOikea - halfWidth)

        obstacle.onUpdate(() => {
        obstacle.pos.x = clamp(obstacle.pos.x, tasoVasen + 30, tasoOikea - 30)
    })
    }

    let spawnRate = 0
    if (difficulty === "easy") {
        spawnRate = 2.0
    }
    else if (difficulty === "medium") {
        spawnRate = 1.5
    }
    else if (difficulty === "hard") {
        spawnRate = 1.0
    }

    loop(spawnRate, () => {
        spawnObstacle()
    })

    player.onCollide("obstacle", () => {
        play("blip")
        destroy(player)
        go("gameover", { score: SCORE, difficulty })
    })

    let scoreTracker = 0
    
    function updateSpeed(){
        if (SCORE >= scoreTracker + 10) {
            if (difficulty === "easy") {
                SPEED += 10
            }
            else if (difficulty === "medium") { 
                SPEED += 20
            }
            else if (difficulty === "hard") {
                SPEED += 30
            }
            scoreTracker += 10
            console.log("speed: ", SPEED)
            play("wooosh")
        }       
    }

    add([
        text("Use WASD to move"),
        pos(40, 20),
        scale(0.5),
        z(100),
    ])
})

go ("difficulty")