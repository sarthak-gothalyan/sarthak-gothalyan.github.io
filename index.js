let canvas = document.querySelector("canvas")
canvas.setAttribute("width", canvas.parentNode.offsetWidth)
canvas.setAttribute("height", canvas.parentNode.offsetHeight)
let ctx = canvas.getContext("2d")

ctx.beginPath()
ctx.fillStyle = "green"
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.stroke()

let col = canvas.width/6
let row = canvas.height/3

let bush = new Image()
bush.src = 'berry.png'
let bushes = 
[
    {id: 1,x: col*2+col/4, y: row/4},
    {id: 2,x: col*3+col/4, y: row/4},
    {id: 3,x: col+col/4, y: row+row/4},
    {id: 4,x: col*4+col/4, y: row+row/4},
    {id: 5,x: col*2+col/4, y: row*2+row/4},
    {id: 6,x: col*3+col/4, y: row*2+row/4}
]
bush.addEventListener(
    "load",
    function()
    {
        bushes.forEach(
            rect => 
            {
                ctx.beginPath()
                ctx.rect(rect.x, rect.y, col/2, row/2)
                ctx.stroke()
                ctx.drawImage(bush, rect.x, rect.y, col/2, row/2)
            }    
        )
    }
)

let player = new Image()
player.src = 'man.png'
player.addEventListener(
    "load",
    function()
    {
        ctx.beginPath()
        ctx.rect(col*3-col/4, row+row/4, col/2, row/2)
        ctx.stroke()
        ctx.drawImage(player, col*3-col/4, row+row/4, col/2, row/2)
    }
)

function isInside(rw, rh, rx, ry, x, y)
{
    return x <= rx+rw && x >= rx && y <= ry+rh && y >= ry
}

canvas.addEventListener("click", (e) =>
    {
        console.log("clicked")
        let pos = {x: e.clientX, y: e.clientY}
        console.log(pos)
        bushes.forEach(
            rect =>
            {
                if(isInside(col/2, row/2, rect.x, rect.y, pos.x, pos.y))
                {
                    alert("Click on Rect:"+rect.id)
                }
            }
        )
    }
)
