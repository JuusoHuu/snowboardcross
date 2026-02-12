kaboom({
    scale: 2,
    background: [0 , 0, 0],
    crisp: true,
})

loadSprite("player", "sprites/player.png")
loadSprite("stone", "sprites/stone.png")
loadSprite("gate", "sprites/gate.png")
loadSprite("log-right", "sprites/log-right.png")
loadSprite("log-left", "sprites/log-left.png")
loadSprite("background", "sprites/background.png")

scene("gameover", (finalScore) => {
    add([
        text("Game Over"),
        pos(width() / 2, height() / 2),
        anchor("center"),
        scale(2),
    ])
    add([
        text("Score: "),
        pos(width() / 2, height() / 2 + 80),
        anchor("center"),        
        scale(1),
    ])
    add([
        text(finalScore),
        pos(width() / 2 + 70, height() / 2 + 82),
        anchor("center"),        
        scale(1),
    ])
    add([
        text("Press Space to Restart"),
        pos(width() / 2, height() / 2 - 120),
        anchor("center"),        
        scale(1),
    ])
    onKeyPress("space", () => {
        go("main")
    })
})
scene("main", () => {
    let SPEED = 70
    const SCALE_X = 7
    const SCALE_Y = 4
    const TILE_W = 57 * SCALE_X
    const TILE_H = 63 * SCALE_Y
    const MOVE_SPEED = 150
    const SCALE = 1.9
    let SCORE = 0
    let OB_SPAWN_RATE = 1.5
    let spawnLoop


    const tilesNeeded = Math.ceil(height() / TILE_H) + 1

    const bgTest = add([
        sprite("background"),
        scale(SCALE_X, SCALE_Y),
    ])
    const REAL_TILEW = bgTest.width
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
        opacity(0),
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

        get ("obstacle").forEach((ob) => {
        ob.move(0, SPEED)

        if (ob.pos.y > 450 && !ob.passed) {
            ob.passed = true
            SCORE++
            score.text = SCORE.toString()
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
        scale(SCALE),
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
            destroy(player)
             go("gameover", SCORE)
        }
    })

    function spawnObstacle(){
        const x = rand(tasoVasen + 20 , tasoOikea - 20)
        const type = choose(["stone", "gate", "log-right", "log-left"])
        
        const obstacle = add([
            sprite(type),
            pos(centerX, -50),
            scale(SCALE),
            area(),
            body({isStatic : true}),
            anchor("center"),
            "obstacle",
        ])
        const halfWidth = obstacle.width / 2
        obstacle.pos.x = rand(tasoVasen + halfWidth, tasoOikea - halfWidth)

        obstacle.onUpdate(() => {
        const halfWidth = obstacle.width / 2
        obstacle.pos.x = clamp(obstacle.pos.x, tasoVasen + 30, tasoOikea - 30)
    })
    }

    player.onCollide("obstacle", () => {
        go("gameover", SCORE)
    })

    let scoreTracker = 0
    
    function updateSpeed() {
    if (SCORE >= scoreTracker + 10) {

        scoreTracker += 10

        OB_SPAWN_RATE += 0.2

        if (OB_SPAWN_RATE > 3) {
            OB_SPAWN_RATE = 3
        }

        spawnLoop.cancel()

        spawnLoop = loop(OB_SPAWN_RATE, () => {
            spawnObstacle()
        })

        console.log("New spawn rate:", OB_SPAWN_RATE)
    }
}

spawnLoop = loop(OB_SPAWN_RATE, () => {
    spawnObstacle()

    const ohje = add([
        text("Use WASD to move"),
        pos(40, 20),
        scale(0.5),
        z(100),
    ])
})


go ("main")

