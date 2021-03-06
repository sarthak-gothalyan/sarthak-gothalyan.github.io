// Canvas Attributes
let canvas1 = document.querySelector('#l1')
let canvas2 = document.querySelector('#l2')
canvas1.setAttribute("width", canvas1.parentNode.offsetWidth)
canvas1.setAttribute("height", canvas1.parentNode.offsetHeight)
canvas2.setAttribute("width", canvas2.parentNode.offsetWidth)
canvas2.setAttribute("height", canvas2.parentNode.offsetHeight)
let ctx1 = canvas1.getContext("2d")
let ctx2 = canvas2.getContext("2d")
ctx2.font = '30px Arial'

// Get Measurement Units
let xu = canvas1.width/12
let yu = canvas1.height/12

// Colour Base Canvas Green and Top canvas Blue
ctx1.beginPath()
ctx1.fillStyle = 'green'
ctx1.fillRect(0, 0, canvas1.width, canvas1.height)
ctx1.stroke()
ctx2.beginPath()
ctx2.fillStyle = 'green'
ctx2.fillRect(0, 0, canvas2.width, canvas2.height)
ctx2.stroke()

// Load and Draw Berries
let bush = new Image()
bush.src = "berry.png"
let bushes = 
[
    {id: 1, x: 10*xu, y: yu, e: 0, r: 80},
    {id: 2, x: 6*xu, y: 2*yu, e: 0, r: 80},
    {id: 3, x: 9*xu, y: 3*yu, e: 0, r: 80}
]
bush.addEventListener("load",
    function()
    {
        bushes.forEach(
            bush_p =>
            {
                ctx1.drawImage(bush, bush_p.x, bush_p.y, xu, yu)
            }
        )
    }
)

// Load Video
let vid = document.createElement("video")
vid.src = "harvest.mp4"
vid.loop = true

// Create a Audio Element for Background Noise
var audio = document.createElement("AUDIO")
document.body.appendChild(audio);
audio.src = "forest.wav"
audio.loop = true

// Global Variables
let state = 'initiate'
let action = ''
let change = false
let dest = -1
let c = 0
let tc = 0
let data = []
let score = 0
let plays = 1
let end = {m: 3, s: 0}
let download = false
let curr_p = {x: 0, y: 0}

// Space Key-press Event for Changing Scene
document.addEventListener("keypress", (e) =>
    {
        if(e.code === 'Space' && state !== 'start')
            state = 'start'
    }
)

// Clear Circular Area
document.addEventListener("mousemove",
    (e) =>
    {
        curr_p.x = e.clientX
        curr_p.y = e.clientY
        if(state !== 'initiate')
            audio.play()
        if(action !== 'forage' && state === 'start')
        {
            ctx2.beginPath()
            ctx2.fillStyle = 'green'
            ctx2.fillRect(2*xu, 0, canvas2.width, canvas2.height)
            ctx2.globalCompositeOperation = 'destination-out'
            ctx2.beginPath() 
            ctx2.arc(e.clientX, e.clientY, 100, 0, 2*Math.PI)
            ctx2.closePath()
            ctx2.fill()
            ctx2.globalCompositeOperation = 'source-over'
        }
    }
)

// Check if Inside Bush Area
function isInside(rw, rh, rx, ry, x, y)
{
    return x <= rx+rw && x >= rx && y <= ry+rh && y >= ry   // Get Click Inside a Bush
}

// Listen To Clicks
document.addEventListener("click",
    (e) =>
    {
        if(state !== 'start')
        {
            state = 'start'
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
            ctx2.fillStyle = 'green'
            ctx2.fillRect(2*xu, 0, canvas2.width, canvas2.height)
        }
        bushes.forEach(
            (b, i) =>
            {
                if(isInside(xu, yu, b.x, b.y, e.clientX, e.clientY) && action !== 'forage')
                {
                    action = 'forage'
                    change = true
                    dest = i
                }
            }
        )
    }
)

//  Update Rewards and Exploits
function update(patch)
{
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
    let loading = bush.complete  // Pause If Resources Not Loaded
    if(!loading)
    alert("loading")
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
    ctx2.fillStyle = 'green'
    ctx2.fillRect(2*xu, 0, canvas2.width, canvas2.height)    
    ctx2.globalCompositeOperation = 'source-over'

    switch(state)
    {
        case 'initiate':
            ctx2.fillStyle = 'black'
            ctx2.fillText("Welcome To The Virtual Foraging Task", 3*xu, yu)
            ctx2.fillText("You are in the center of a field surrounded by 6 berry shrubs.", 3*xu, yu + yu/2)
            ctx2.fillText("All the shrubs are equi distant from you and from their neighbours.", 3*xu, 2*yu)
            ctx2.fillText("Click on the shrub you want to pick beries from.", 3*xu, 2*yu + yu/2)
            ctx2.fillText("You have a total of 5 mins to harvest as much berries as you can.", 3*xu, 3*yu)
            ctx2.fillText("Travel Time is proportional to the distance between shrubs.", 3*xu, 3*yu + yu/2)
            ctx2.fillText("For any adjacent shrub, Travel Time costs 1 sec.", 3*xu, 4*yu)
            ctx2.fillText("After pressing Spacebar while on a shrub, wait for the reward to popup.This is your berry harvest time.", 3*xu, 4*yu + yu/2)
            ctx2.fillText("For any shrub, Harvesting Time costs 0.5 sec.", 3*xu, 5*yu)
            ctx2.fillText("Happy Foraging.", 3*xu, 5*yu + yu/2)
            ctx2.fillText("Press space to continue", 3*xu, 6*yu)
            return

        case 'start':
            ctx2.fillStyle = 'black'
            let seconds = Math.floor(tc/100)
            let minutes = Math.floor(seconds/60)
            seconds = seconds%60
            ctx2.fillText(`Time: ${minutes}:${seconds}`, xu/3, yu)
            ctx2.fillText("Score: " + score, xu/3, 2*yu)
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

                ctx1.fillStyle = 'green'
                ctx1.fillRect(0, 0, canvas1.width, canvas1.height)
                bushes = 
                [
                    {id: 1, x: 7*xu, y: 400, e: 0, r: 80},
                    {id: 3, x: 7*xu, y: 500, e: 0, r: 80},
                    {id: 2, x: 7*xu, y: 600, e: 0, r: 80}
                ]
                bush.src = "bush.png"
            }
            break
            
        case 'change':
            ctx2.fillStyle = 'green'
            ctx2.fillRect(0, 0, canvas2.width, canvas2.height)
            action = ''
            tc = 0
            score = 0
            // Update End Condition
            ctx2.fillStyle = 'black'
            ctx2.fillText("We will now move to a new forest to forage.", 3*xu, yu)
            ctx2.fillText("Press space to continue foraging.", 3*xu, 2*yu)
            return
        
        case 'end':
            ctx2.fillStyle = 'green'
            ctx2.fillRect(0, 0, canvas2.width, canvas2.height)
            if(!download)
            {
                download_csv(data)
                download = true
                console.log(data)
            }
            ctx2.fillStyle = 'black'
            ctx2.fillText("Thank you for playing.", 3*xu, 3*yu)
            audio.pause()
            return
    }

    switch(action)
    {
        case 'forage':
            if(change)
            {
                change = false
                ctx2.fillStyle = 'green'
                ctx2.fillRect(2*xu, 0, canvas2.width, canvas2.height)
                vid.play()
            }
            if(c === 440)
            {
                update(dest)
                score += bushes[dest].r
                data.push([bushes[dest].id, bushes[dest].e, bushes[dest].r])
                vid.pause()

                ctx2.fillStyle = 'green'
                ctx2.fillRect(2*xu, 0, canvas2.width, canvas2.height)
                console.log(c)
            }
            
            if(c >= 440)
            {
                ctx2.fillStyle = 'white'
                ctx2.fillText("+" + bushes[dest].r, bushes[dest].x, bushes[dest].y)
            }
            else
                ctx2.drawImage(vid, bushes[dest].x, bushes[dest].y, xu, yu)
            
            if(c === 500)
            {
                action = ''
                c = 0
            }
            c++
            break

        default:
            break
    }

    ++tc
}
setInterval(draw, 10)