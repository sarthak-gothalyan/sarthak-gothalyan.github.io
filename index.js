//  Canvas Attributes Set
let canvas = document.querySelector("canvas")
canvas.setAttribute("width", canvas.parentNode.offsetWidth)
canvas.setAttribute("height", canvas.parentNode.offsetHeight)
let ctx = canvas.getContext("2d")   // Get Draw Context
ctx.font = "30px Arial" // Set Font For UI

//  Colour Entire Screen Green
ctx.beginPath()
ctx.fillStyle = "green"
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.stroke()

let col = canvas.width/6    // Width of one partition
let row = canvas.height/3   // Height of one partition

//  Create a Video element to play during foraging
let vid = document.createElement("video")
vid.src = "harvest.mp4"
vid.loop = true

// Create a Audio Element for Background Noise
var audio = document.createElement("AUDIO")
document.body.appendChild(audio);
audio.src = "forest.wav"
document.body.addEventListener("mousemove", // Add Mouse Movement as audio starter
    function () 
    {
        audio.play()
    }
)

//  Draw Bushes
let bush = new Image()
bush.src = 'berry.png'
// Set Bush Attributes
let bushes = 
[
    {id: 1, x: col*2+col/4, y: row/4, e: 0, r: 0, empty: true},
    {id: 2, x: col*3+col/4, y: row/4, e: 0, r: 80, empty: false},
    {id: 6, x: col+col/4, y: row+row/4, e: 0, r: 0, empty: true},
    {id: 3, x: col*4+col/4, y: row+row/4, e: 0, r: 80, empty: false},
    {id: 5, x: col*2+col/4, y: row*2+row/4, e: 0, r: 80, empty: false},
    {id: 4, x: col*3+col/4, y: row*2+row/4, e: 0, r: 0, empty: true}
]
// Draw Bush on load
bush.addEventListener(
    "load",
    function()
    {
        bushes.forEach(
            rect => 
            {
                ctx.beginPath() // Begin Draw
                ctx.rect(rect.x, rect.y, col/2, row/2)  // (pos-x, pos-y, width, height)
                ctx.stroke()    // End Draw
                ctx.drawImage(bush, rect.x, rect.y, col/2, row/2) // (image, pos-x, pos-y, width, height)
            }    
        )
    }
)

// Draw Player
let player = new Image()
player.src = 'man.png'
player.addEventListener(
    "load",
    function()
    {
        ctx.beginPath() // Begin Draw
        ctx.rect(col*3-col/4, row+row/4, col/2, row/2)  // (pos-x, pos-y, width, height)
        ctx.stroke()    // End Draw
        ctx.drawImage(player, col*3-col/4, row+row/4, col/2, row/2) // (image, pos-x, pos-y, width, height)
    }
)

function isInside(rw, rh, rx, ry, x, y)
{
    return x <= rx+rw && x >= rx && y <= ry+rh && y >= ry   // Get Click Inside a Bush
}


//  Consatants Defined
const speed = Math.sqrt((canvas.width/1000)*(canvas.width/1000) + (canvas.height/1000)*(canvas.width/1000))
let dest = -1
let p_pos = {x: col*3-col/4, y: row+row/4}
let action = ""
let skip = {x: 0, y: 0}
let c = 0   // Counter For Timeskip
let tc = 0  // Counter For Time
let score = 0

//  Set Click Event
canvas.addEventListener("click", (e) =>
    {
        let pos = {x: e.clientX, y: e.clientY}  // Click Position
        bushes.forEach( // Check for each Bush
            (rect, i) =>
            {
                if(isInside(col/2, row/2, rect.x, rect.y, pos.x, pos.y) && action !== 'moving')
                {
                    action = "moving"
                    dest = i
                    const p = bushes[dest].x - p_pos.x
                    const b = bushes[dest].y - p_pos.y
                    const h = Math.sqrt(p*p + b*b)
                    skip.x = speed * p/h
                    skip.y = speed * b/h                                   
                }
            }
        )
    }
)

document.addEventListener("keypress", (e) =>
    {
        let temp = bushes.filter(rect => isInside(col/2, row/2, rect.x, rect.y, p_pos.x, p_pos.y) ? true : false)
        if(temp.length > 0)
        {    
            action = 'forage'
            vid.play()
        }
    }
)

//  Check if Player Reached the target Bush
function reached(p, d, skip)
{
    if(skip.x >= 0 && skip.y >= 0)
        return p.x >= d.x && p.y >= d.y
    else if(skip.x >= 0 && skip.y <= 0)
        return p.x >= d.x && p.y <= d.y
    else if(skip.x <= 0 && skip.y >= 0)
        return p.x <= d.x && p.y >= d.y
    else if(skip.x <= 0 && skip.y <= 0)
        return p.x <= d.x && p.y <= d.y
}

//  Update Rewards
function update(patch)
{
    bushes.forEach(
        (b, i) =>
        {
            if(b.empty)
                return

            if(i === patch)
                b.r = b.r <= 0 ? 0 : Math.floor(Math.pow(0.95, b.e++) * b.r)   // e gets up by 1 for each calculation
            else
                b.r = b.r <= 0 ? 5 : b.r>=100 || b.r*1.1 >= 100 ? 100 : b.r*1.1 

            bushes[i].r = b.r
            bushes[i].e = b.e
        }
    )
}

//  Update Loop
function draw()
{
    let loading = bush.complete && player.complete  // Pause If Resources Not Loaded
    if(!loading)
        alert("loading")

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.fillStyle = "green"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.stroke()
    ctx.fillStyle = 'black'
    let seconds = Math.floor(tc/100)
    let minutes = Math.floor(seconds/60)
    seconds = seconds%60
    ctx.fillText(`Time: ${minutes}:${seconds}`, col/4, row/4)
    ctx.fillText("Score: " + score, col/4, row/2.5)

    switch(action)
    {
        case 'moving':
            bushes.forEach(
                rect => 
                {
                    ctx.beginPath() // Begin Draw
                    ctx.rect(rect.x, rect.y, col/2, row/2)  // (pos-x, pos-y, width, height)
                    ctx.stroke()    // End Draw
                    ctx.drawImage(bush, rect.x, rect.y, col/2, row/2) // (image, pos-x, pos-y, width, height)
                }    
            )

            p_pos.x += skip.x
            p_pos.y += skip.y
            ctx.beginPath() // Begin Draw
            ctx.rect(p_pos.x, p_pos.y, col/2, row/2)  // (pos-x, pos-y, width, height)
            ctx.stroke()    // End Draw
            ctx.drawImage(player, p_pos.x, p_pos.y, col/2, row/2) // (image, pos-x, pos-y, width, height)

            if(reached(p_pos, bushes[dest], skip))
            {
                action = ''
                p_pos.x = bushes[dest].x
                p_pos.y = bushes[dest].y
            }
            
            break

        case 'forage':
            if(c === 440)
            {
                update(dest)
                score += bushes[dest].r
                vid.pause()
            }
            
            if(c > 440)
            {
                ctx.fillStyle = 'white'
                ctx.fillText("+" + bushes[dest].r, bushes[dest].x, bushes[dest].y)
            }
            else
                ctx.drawImage(vid, bushes[dest].x, bushes[dest].y, col/2, row/2)
            
            if(c === 500)
            {
                action = ''
                c = 0
            }
            c++
            break

        default:
            bushes.forEach(
                rect => 
                {
                    ctx.beginPath() // Begin Draw
                    ctx.rect(rect.x, rect.y, col/2, row/2)  // (pos-x, pos-y, width, height)
                    ctx.stroke()    // End Draw
                    ctx.drawImage(bush, rect.x, rect.y, col/2, row/2) // (image, pos-x, pos-y, width, height)
                }    
            )

            ctx.beginPath() // Begin Draw
            ctx.rect(p_pos.x, p_pos.y, col/2, row/2)  // (pos-x, pos-y, width, height)
            ctx.stroke()    // End Draw
            ctx.drawImage(player, p_pos.x, p_pos.y, col/2, row/2) // (image, pos-x, pos-y, width, height)
    }

    tc++
}
setInterval(draw, 10)