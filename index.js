// Set Canvas Attributes
let canvas = document.querySelector("canvas")
canvas.setAttribute("width", 1250)
canvas.setAttribute("height", 750)
let ctx = canvas.getContext("2d")
ctx.font = "30px Arial"
let difficulty = document.querySelector("input")
let sub = document.querySelector("button")
let p = document.querySelector("p")
p.style.display = "none"
sub.style.display = "none"
difficulty.style.display = "none"

//  Check if inside bush
function isInside(rw, rh, rx, ry, x, y)
{
    return x <= rx+rw && x >= rx && y <= ry+rh && y >= ry   // Get Click Inside a Bush
}

// Random List Generator
function l(size, to_empty)
{
    let id = 1
    let bushes = []
    while(bushes.length <= size)
    { 
        let bush = {id: id, x: Math.floor(Math.random()*910) + 300, y: Math.floor(Math.random()*720) + 10, e: 0, r: 100, empty: false}
        bushes = bushes.filter(b => !isInside(140, 140, bush.x - 70, bush.y - 70, b.x, b.y))
        bushes.push(bush)
        if(bushes.length === id)
            ++id
        else
            continue
    }
    for(x = 0; x < to_empty; ++x)
    {    
        bushes[x].empty = true
        bushes[x].r = 0
    }
    return bushes
}

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
let end = {m: 0, s: 3}  //  End time of Single Playthrough
let plays = 1   // Playthrough Count
let download = false    // So csv Downloads Just once
let bushes = l(6, 3)
let get_difficulty = true
let diff = 0;

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
        {
            tc = 0
            state = "start"
        }

        bushes.forEach(
            (b, i) =>
            {
                if(isInside(30, 30, b.x, b.y, e.clientX, e.clientY) && action === "searching" && state === "start")
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

//  Submission Button
sub.addEventListener("click",
    (e) =>
    {
        get_difficulty = false
        diff = difficulty.value
        sub.style.display = "none"
        difficulty.style.display = "none"
        p.style.display = "none"
    }
)

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
            ctx.fillText("You are in a field with hidden berry bushes.", 300, 150)
            ctx.fillText("Move your mouse around to look for the bushes.", 300, 200)
            ctx.fillText("Click on the shrub you want to pick beries from.", 300, 250)
            ctx.fillText("You have a total of 3 mins to harvest as much berries as you can.", 300, 300)
            ctx.fillText("For any shrub, Harvesting Time costs 0.5 sec.", 300, 350)
            ctx.fillText("Happy Foraging.", 300, 400)
            ctx.fillText("CLick to continue", 300, 450)
            return

        case 'start':
            ctx.fillStyle = 'black'
            let seconds = Math.floor(tc/100)
            let minutes = Math.floor(seconds/60)
            seconds = seconds%60
            ctx.fillText(`Time: ${minutes}:${seconds}`, 100, 100)
            ctx.fillText("Score: " + score, 100, 140)
            if(minutes === end.m && seconds === end.s)
            {
                switch(plays)
                {
                    case 1:
                        state = "change"
                        ++plays
                        data.push([-1, -1, score])
                        bushes = l(8, 4)
                        audio.pause()
                        end.m = 0
                        bush.src = "bush.png"
                        return

                    case 2:
                        state = "change"
                        ++plays
                        data.push([-1, -1, score])
                        bushes = l(6, 3)
                        audio.pause()
                        end.m = 0
                        bush.src = "bush.png"
                        return

                    case 3:
                        state = "change"
                        ++plays
                        data.push([-1, -1, score])
                        bushes = l(8, 4)
                        audio.pause()
                        bush.src = "bush.png"
                        return

                    case 4:
                        state = "change"
                        ++plays
                        data.push([-1, -1, score])
                        bushes = l(6, 3)
                        audio.pause()
                        bush.src = "bush.png"
                        return

                    default:
                        audio.pause()
                        tc = 0;
                        state = "end"
                        return
                }
            }
            break
            
        case 'change':
            action = 'searching'
            score = 0
            // Update End Condition
            ctx.fillStyle = 'black'
            ctx.fillText("We will now move to a new forest to forage.", 300, 300)
            ctx.fillText("Click to continue foraging.", 300, 350)
            return
        
        case 'end':
            if(!download)
            {
                download_csv(data)
                download = true
            }
            if(get_difficulty)
            {
                ctx.fillStyle = 'black'
                ctx.fillText("Please give difficulty.", 300, 300)
                sub.style.display = "block"
                difficulty.style.display = "block"
                sub.style.display = "block"
                p.style.display = "block"
                p.textContent = difficulty.value
            }
            else
            {
                ctx.fillStyle = 'black'
                ctx.fillText("Thank you for playing.", 300, 300)
            }
            return
    }

    switch(action)
    {
        case "searching":
            bushes.forEach(
                rect => 
                {
                    if(isInside(30, 30, rect.x, rect.y, pos.x, pos.y))
                        ctx.drawImage(bush, rect.x, rect.y, 30, 30) // (image, pos-x, pos-y, width, height)
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
                    ctx.drawImage(bush, rect.x, rect.y, 30, 30) // (image, pos-x, pos-y, width, height)
                }    
            )
    }

    ++tc
}
setInterval(draw, 10)