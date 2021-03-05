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

//  X, Y Partitions
let col = canvas.width/6    // Width of one partition
let row = canvas.height/3   // Height of one partition

//  Create a Video element to play during foraging
let vid = document.createElement("video")
vid.src = "harvest.mp4"
vid.loop = true


//  Draw Bushes
let bush = new Image()
bush.src = 'berry.png'
// Set Bush Attributes
let bushes = 
[
    {id: 1, x: col*2+col/4, y: col/4, e: 0, r: 0, empty: true},
    {id: 2, x: col*3+col/4, y: col/4, e: 0, r: 80, empty: false},
    {id: 6, x: col*2+col/4 - col*Math.cos(Math.PI/3), y: col/4 + col*Math.sin(Math.PI/3), e: 0, r: 0, empty: true},
    {id: 3, x: col*3+col/4 + col*Math.cos(Math.PI/3), y: col/4 + col*Math.sin(Math.PI/3), e: 0, r: 80, empty: false},
    {id: 5, x: col*2+col/4, y: col/4 + 2*col*Math.sin(Math.PI/3), e: 0, r: 80, empty: false},
    {id: 4, x: col*3+col/4, y: col/4 + 2*col*Math.sin(Math.PI/3), e: 0, r: 0, empty: true}
]
// Draw Bush on load
bush.addEventListener(
    "load",
    function()
    {
        bushes.forEach(
            rect => 
            {
                ctx.drawImage(bush, rect.x, rect.y, col/2, col/2) // (image, pos-x, pos-y, width, height)
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
        ctx.drawImage(player, col*3 - col/4, col/4 + col*Math.sin(Math.PI/3), col/2, col/2) // (image, pos-x, pos-y, width, height)
    }
)
   
//  Check if Mouse click is inside bush
function isInside(rw, rh, rx, ry, x, y)
{
    return x <= rx+rw && x >= rx && y <= ry+rh && y >= ry   // Get Click Inside a Bush
}
            
            
//  Consatants Defined
const dt = 6    // Time between adjacent bush
const speed = col/(100*dt)
let dest = -1   // Destination Bush
let p_pos = {x: col*3 - col/4, y: col/4 + col*Math.sin(Math.PI/3)}  // Player Position
let action = ""     // Action
let skip = {x: 0, y: 0}     // X, Y parts of speed
let c = 0   // Counter For Timeskip
let tc = 0  // Counter For Time
let score = 0
let data = []   // Data Collected in array form
let state = 'initiate'  // State of Game
let end = {m: 3, s: 0}  //  End time of Single Playthrough
let plays = 1   // Playthrough Count
let download = false    // So csv Downloads Just once
    
    
// Create a Audio Element for Background Noise
var audio = document.createElement("AUDIO")
document.body.appendChild(audio);
audio.src = "forest.wav"
audio.loop = true
document.body.addEventListener("mousemove", // Add Mouse Movement as audio starter
    function () 
    {
        if(!(state === 'initiate'))
            audio.play()
    }
)

//  Set Event for Fixing a Destination Bush
canvas.addEventListener("click", (e) =>
    {
        let pos = {x: e.clientX, y: e.clientY}  // Click Position
        bushes.forEach( // Check for each Bush
            (rect, i) =>
            {
                if(isInside(col/2, col/2, rect.x, rect.y, pos.x, pos.y) && action !== 'moving')
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

//  Set Event for Foraging
document.addEventListener("keypress", (e) =>
    {
        if(e.code === 'Space')
        {
            state = 'start'
            if(isInside(col/2, col/2, bushes[dest].x, bushes[dest].y, p_pos.x, p_pos.y))
            {    
                action = 'forage'
                vid.play()
            }
        }
    }
)

document.addEventListener("click",  // For Click 
    (e) =>
    {
        if(bushes[dest].x === p_pos.x && bushes[dest].y === p_pos.y && isInside(col/2, col/2, bushes[dest].x, bushes[dest].y, e.clientX, e.clientY))
        {    
            state = 'start'
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

//  Update Rewards and Exploits
function update(patch)
{
    if(bushes[patch].empty)
        return
    bushes.forEach(
        (b, i) =>
        {
            if(i === patch)
                b.r = b.r <= 0 ? 0 : Math.floor(Math.pow(0.95, b.e++) * b.r)   // e gets up by 1 for each calculation
            else if(b.empty)
                return
            else
                b.r = b.r <= 0 ? 3 : b.r>=100 || b.r*1.3 >= 100 ? 100 : Math.floor(b.r*1.3)

            bushes[i].r = b.r
            bushes[i].e = b.e
        }
    )
}

//  Write Data to a file
function download_csv(data) {
    var csv = 'Bush_id,Exploit,Reward\n'
    data.forEach(
        row => 
        {
            csv += row.join(',')
            csv += "\n"
        }
    )
  
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'data.csv';
    hiddenElement.click();
}

// Random Outputs
console.log('speed: ' + speed)
console.log('')

//  Update Loop
function draw()
{
    let loading = bush.complete && player.complete  // Pause If Resources Not Loaded
    if(!loading)
    alert("loading")
    
    // Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.fillStyle = "green"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.stroke()
    
    switch(state)
    {
        case 'initiate':
            ctx.fillStyle = 'black'
            ctx.fillText("Welcome To The Virtual Foraging Task", col, row/4)
            ctx.fillText("You are in the center of a field surrounded by 6 berry shrubs.", col, row/2)
            ctx.fillText("All the shrubs are equi distant from you and from their neighbours.", col, 3*row/4)
            ctx.fillText("Click on the shrub you want to pick beries from.", col, row)
            ctx.fillText("You have a total of 5 mins to harvest as much berries as you can.", col, row+row/4)
            ctx.fillText("Travel Time is proportional to the distance between shrubs.", col, row+row/2)
            ctx.fillText("For any adjacent shrub, Travel Time costs 1 sec.", col, row+3*row/4)
            ctx.fillText("After pressing Spacebar while on a shrub, wait for the reward to popup.This is your berry harvest time.", col, row*2)
            ctx.fillText("For any shrub, Harvesting Time costs 0.5 sec.", col, row*2+row/4)
            ctx.fillText("Happy Foraging.", col, row*2+row/2)
            ctx.fillText("Press space to continue", col, row*2+3*row/4)
            return

        case 'start':
            ctx.fillStyle = 'black'
            let seconds = Math.floor(tc/100)
            let minutes = Math.floor(seconds/60)
            seconds = seconds%60
            ctx.fillText(`Time: ${minutes}:${seconds}`, col/4, row/4)
            ctx.fillText("Score: " + score, col/4, row/2.5)
            if(minutes === end.m && seconds === end.s)
            {
                if(plays === 2)
                {
                    state = 'end'
                    return
                }
                ++plays
                data.push([-1, -1, score])
                state = 'change'
                bush.src = "bush.png"
            }
            break
            
        case 'change':
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            action = ''
            tc = 0
            p_pos = {x: col*3 - col/4, y: col/4 + col*Math.sin(Math.PI/3)}
            score = 0
            // Update End Condition
            bushes = 
            [
                {id: 1, x: col*2+col/4, y: col/4, e: 0, r: 80, empty: false},
                {id: 2, x: col*3+col/4, y: col/4, e: 0, r: 80, empty: false},
                {id: 6, x: col*2+col/4 - col*Math.cos(Math.PI/3), y: col/4 + col*Math.sin(Math.PI/3), e: 0, r: 80, empty: false},
                {id: 3, x: col*3+col/4 + col*Math.cos(Math.PI/3), y: col/4 + col*Math.sin(Math.PI/3), e: 0, r: 80, empty: false},
                {id: 5, x: col*2+col/4, y: col/4 + 2*col*Math.sin(Math.PI/3), e: 0, r: 80, empty: false},
                {id: 4, x: col*3+col/4, y: col/4 + 2*col*Math.sin(Math.PI/3), e: 0, r: 80, empty: false}
            ]
            ctx.fillStyle = 'black'
            ctx.fillText("We will now move to a new forest to forage.", col*2, row)
            ctx.fillText("Press space to continue foraging.", col*2, row+row/4)
            return
        
        case 'end':
            if(!download)
            {
                download_csv(data)
                download = true
                console.log(data)
            }
            ctx.fillStyle = 'black'
            ctx.fillText("Thank you for playing.", col*2, row)
            return
    }
    
    switch(action)
    {
        case 'moving':
            bushes.forEach(
                rect => 
                {
                    ctx.drawImage(bush, rect.x, rect.y, col/2, col/2) // (image, pos-x, pos-y, width, height)
                }    
            )
                
            if(reached(p_pos, bushes[dest], skip))
            {
                action = ''
                p_pos.x = bushes[dest].x
                p_pos.y = bushes[dest].y
                break
            }

            p_pos.x += skip.x
            p_pos.y += skip.y
            ctx.drawImage(player, p_pos.x, p_pos.y, col/2, col/2) // (image, pos-x, pos-y, width, height)
            
            break

        case 'forage':
            if(c === 440)
            {
                update(dest)
                score += bushes[dest].r
                data.push([bushes[dest].id, bushes[dest].e, bushes[dest].r])
                vid.pause()
            }
            
            if(c > 440)
            {
                ctx.fillStyle = 'white'
                ctx.fillText("+" + bushes[dest].r, bushes[dest].x, bushes[dest].y)
            }
            else
            ctx.drawImage(vid, bushes[dest].x, bushes[dest].y, col/2, col/2)
            
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
                    ctx.drawImage(bush, rect.x, rect.y, col/2, col/2) // (image, pos-x, pos-y, width, height)
                }    
            )

            ctx.drawImage(player, p_pos.x, p_pos.y, col/2, col/2) // (image, pos-x, pos-y, width, height)
    }
    
    tc++
}
setInterval(draw, 10)