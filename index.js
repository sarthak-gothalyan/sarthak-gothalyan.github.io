// Set Canvas Attributes
let canvas = document.querySelector("canvas")
canvas.setAttribute("width", 1500)
canvas.setAttribute("height", 1500)
let ctx = canvas.getContext("2d")

// Load Image
let bush = new Image()
bush.src = "berry.png"

// Load Video
let vid = document.createElement("video")
vid.src = "harvest.mp4"
vid.loop = true

// Load Audio
var audio = document.createElement("AUDIO")
document.body.appendChild(audio);
audio.src = "forest.wav"
audio.loop = true


// Global Variables
let pos = {x: 0, y: 0}
let dest = -1   // Destination Bush
let action = "searching"     // Action
let c = 0   // Counter For Timeskip
let tc = 0  // Counter For Time
let score = 0
let data = []   // Data Collected in array form
let state = 'initiate'  // State of Game
let end = {m: 0, s: 15}  //  End time of Single Playthrough
let plays = 1   // Playthrough Count
let download = false    // So csv Downloads Just once
let bushes = 
[
    {id: 1, x: 500, y: 500, e: 0, r: 100}
]

// Update Reards
function update(patch)
{
    if(bushes[patch].empty)
        return
    bushes.forEach(
        (b, i) =>
        {
            if(i === patch)
                b.r = b.r <= 0 ? 0 : Math.floor(Math.pow(0.95, b.e++) * b.r)   // e gets up by 1 for each calculation
            else
                b.r = b.r <= 0 ? 3 : b.r>=100 || b.r*1.3 >= 100 ? 100 : Math.floor(b.r*1.3)

            bushes[i].r = b.r
            bushes[i].e = b.e
        }
    )
}

//  Check if inside bush
function isInside(rw, rh, rx, ry, x, y)
{
    return x <= rx+rw && x >= rx && y <= ry+rh && y >= ry   // Get Click Inside a Bush
}

// Create Mouse-move Event
document.body.addEventListener("mousemove",
    function (e) 
    {
        pos = {x: e.clientX, y: e.clientY}

        if(!(state === 'initiate') && !(state === 'change'))     // Add Mouse Movement as audio starter
            audio.play()
    }
)

// Create CLick Event for Foraging and Scene Change
document.addEventListener("click",
    function (e)
    {
        if(state === "change" || state === "initiate")
            state = "start"

        bushes.forEach(
            (b, i) =>
            {
                if(isInside(100, 100, b.x, b.y, e.clientX, e.clientY) && action === "searching" && state === "start")
                {
                    action = "forage"
                    dest = i
                    vid.play()
                }
            }
        )
    }
)

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

// Game Loop
function draw()
{
    if(!bush.complete)
    {
        alert("loading")
        return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'green'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    switch(state)
    {
        case 'initiate':
            ctx.fillStyle = 'black'
            ctx.fillText("Welcome To The Virtual Foraging Task", 300, 100)
            ctx.fillText("You are in the center of a field surrounded by 6 berry shrubs.", 300, 200)
            ctx.fillText("All the shrubs are equi distant from you and from their neighbours.", 300, 300)
            ctx.fillText("Click on the shrub you want to pick beries from.", 300, 400)
            ctx.fillText("You have a total of 5 mins to harvest as much berries as you can.", 300, 500)
            ctx.fillText("Travel Time is proportional to the distance between shrubs.", 300, 600)
            ctx.fillText("For any adjacent shrub, Travel Time costs 1 sec.", 300, 700)
            ctx.fillText("After pressing Spacebar while on a shrub, wait for the reward to popup.This is your berry harvest time.", 300, 800)
            ctx.fillText("For any shrub, Harvesting Time costs 0.5 sec.", 300, 900)
            ctx.fillText("Happy Foraging.", 300, 1000)
            ctx.fillText("Press space to continue", 300, 1100)
            return

        case 'start':
            ctx.fillStyle = 'black'
            let seconds = Math.floor(tc/100)
            let minutes = Math.floor(seconds/60)
            seconds = seconds%60
            ctx.fillText(`Time: ${minutes}:${seconds}`, 100, 100)
            ctx.fillText("Score: " + score, 100, 120)
            if(minutes === end.m && seconds === end.s)
            {
                if(plays === 2)
                {
                    state = 'end'
                    audio.pause()
                    return
                }
                ++plays
                data.push([-1, -1, score])
                state = 'change'
                bush.src = "bush.png"
                audio.pause()
            }
            break
            
        case 'change':
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            action = 'searching'
            tc = 0
            score = 0
            // Update End Condition
            bushes = 
            [
                {id: 1, x: 500, y: 500, e: 0, r: 100},
            ]
            ctx.fillStyle = 'black'
            ctx.fillText("We will now move to a new forest to forage.", 300, 300)
            ctx.fillText("Press space to continue foraging.", 300, 300)
            return
        
        case 'end':
            if(!download)
            {
                download_csv(data)
                download = true
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = 'black'
            ctx.fillText("Thank you for playing.", 300, 300)
            return
    }

    switch(action)
    {
        case "searching":
            bushes.forEach(
                rect => 
                {
                    if(isInside(100, 100, rect.x, rect.y, pos.x, pos.y))
                        ctx.drawImage(bush, rect.x, rect.y, 100, 100) // (image, pos-x, pos-y, width, height)
                }    
            )
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
                ctx.drawImage(vid, bushes[dest].x, bushes[dest].y, 100, 100)
            
            if(c === 500)
            {
                action = 'searching'
                c = 0
            }
            c++
            break
                
        default:
            console.log("default reached", action)
            bushes.forEach(
                rect => 
                {
                    ctx.drawImage(bush, rect.x, rect.y, 100, 100) // (image, pos-x, pos-y, width, height)
                }    
            )
    }

    ++tc
}
setInterval(draw, 10)