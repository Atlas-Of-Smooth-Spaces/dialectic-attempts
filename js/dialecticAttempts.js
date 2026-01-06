// Imports
import {etudePartIComplexityScientist} from '../texts/DieStimmungSetztSich.js'
import {etudeTeil1Hanne} from '../texts/EtudeTeil1Hanne.js'
import {damienText1} from '../texts/Damien.js'
import {damienText2} from '../texts/Damien2.js'

// Constants
const BaseSize = 10
const SizeFactor = 20

// Regular expressions
const reParantheses = /\(([^)]+)\)/
const reCurlyBracketLeft = /^\s*{\s*$/
const reCurlyBracketRight = /^\s*}\s*$/
const reEmptyLine = /^\s*$/

// State
const playState = {}
const clickLocked = {}

// SVG utility functions
function getNode(n, v) {
    n = document.createElementNS("http://www.w3.org/2000/svg", n)
    for (var p in v)
        n.setAttributeNS(null, p, v[p])
    return n
}

function getTextNode(text, v) {
    const node = getNode("g", {})
    const textNode = getNode("text", v)
    text = document.createTextNode(text)
    textNode.appendChild(text)
    node.appendChild(textNode)
    return node
}

function getMP4Video(src, tx, ty, scx, scy, x, y, width, height, id) {
    const n = getNode("g", {transform: `translate(${tx},${ty}) scale(${scx}, ${scy})`})
    const fO = getNode("foreignObject", {"x": x, "y": y, "width": width, "height": height})
    const vid = document.createElement("video")
    vid.setAttribute("id", id)
    vid.setAttribute("width", width)
    vid.setAttribute("height", height)
    vid.setAttribute("loop", "")
    vid.setAttribute("muted", "")
    vid.setAttribute("autoplay", "")
    vid.setAttribute("style", '"position: fixed; left: 0px; top: 0px;"')
    vid.setAttribute("xmlns", "http://www.w3.org/1999/xhtml")
    vid.playbackRate = 1.0
    const sourceNode = document.createElement("source")
    sourceNode.setAttribute("src", src)
    sourceNode.setAttribute("type", "video/mp4")
    vid.appendChild(sourceNode)
    fO.appendChild(vid)
    n.appendChild(fO)
    return n
}

// Text parsing functions
function parse(text) {
    let textContent = []
    let indices = {}
    let thisLevelChildren = {}
    let rows = text.split('\n')
    let level = 0
    let topic = 0
    let emptyLines = 0
    let id = ""
    let parent = ""

    for (let i = 0; i < rows.length; i++) {
        let curlyLeft = reCurlyBracketLeft.exec(rows[i])
        if (curlyLeft) {
            level++
            parent = (textContent[indices[id]].areVerbs) ? 
                textContent[indices[id]].verbsBelongTo : id
            continue
        }

        let curlyRight = reCurlyBracketRight.exec(rows[i])
        if (curlyRight) {
            textContent[indices[parent]].children = thisLevelChildren[level]
            thisLevelChildren[level] = []
            parent = textContent[indices[parent]].parent
            level--
            continue
        }

        let emptyLine = reEmptyLine.exec(rows[i])
        if (emptyLine) {
            if (emptyLines == 1) topic++
            emptyLines++
            continue
        } else {
            emptyLines = 0
        }

        let match = reParantheses.exec(rows[i])
        if (match) {
            id = match[0]
            let lastId = textContent[textContent.length - 1].id
            textContent.push({
                "verbsBelongTo": lastId,
                "areVerbs": true,
                "level": level,
                "parent": parent,
                "children": [],
                "id": id,
                "text": match[0],
                "topic": topic
            })
        } else {
            id = rows[i]
            textContent.push({
                "verbsBelongTo": "",
                "areVerbs": false,
                "level": level,
                "parent": parent,
                "children": [],
                "id": id,
                "text": rows[i],
                "topic": topic
            })
        }

        if (level > 0) {
            if (thisLevelChildren[level]) {
                thisLevelChildren[level].push(id)
            } else {
                thisLevelChildren[level] = [id]
            }
        }

        indices[id] = textContent.length - 1
    }
    return textContent
}

function fillTextContent(svg, rawText, x0, y0, width, yspacing_min, yspacing_max) {
    let parsed = parse(rawText)
    let y = y0
    let x = 0

    for (let row of parsed) {
        x = x0 + Math.random() * width
        let fontSize = BaseSize + SizeFactor * (2 ** (-row.level))
        let textNode = getTextNode(
            row.text,
            {
                id: row.id,
                x: x.toString(),
                y: y.toString(),
                style: `font-style:thick; 
                    font-weight:2px; font-size:${Math.round(fontSize)}px; fill:#000000; line-height:1.25;
                    fill-opacity:1;
                    stroke:none;
                    stroke-width:0.26458332"`
            }
        )
        svg.appendChild(textNode)
        y += yspacing_min + Math.random() * (yspacing_max - yspacing_min)
    }
}

function addEventListenersToTextElements(rawText) {
    let parsed = parse(rawText)

    for (let row of parsed) {
        if (row.children) {
            let parent = document.getElementById(row.id)
            parent.addEventListener('click', () => {
                for (let child of row.children) {
                    let element = document.getElementById(child)
                    element.setAttribute("display",
                        (element.getAttribute("display") == "none") ?
                        "inline" : "none")
                }
            })
        }
    }
}

function toggleVideoPlayback(videoId) {
    const video = document.getElementById(videoId)
    if (playState[videoId]) {
        video.pause()
        playState[videoId] = false
        clickLocked[videoId] = false
    } else {
        video.playbackRate = 1.0
        video.play()
        playState[videoId] = true
        clickLocked[videoId] = true
    }
}

function setupVideoHover(videoId) {
    const video = document.getElementById(videoId)
    video.addEventListener("mouseenter", () => {
        if (!clickLocked[videoId]) {
            video.playbackRate = 1.0
            video.play()
            playState[videoId] = true
        }
    })
    video.addEventListener("mouseleave", () => {
        if (!clickLocked[videoId]) {
            video.pause()
            playState[videoId] = false
        }
    })
}

// Main execution
const svg = getNode("svg", {height: "2400", width: "2400", viewBox: "0 0 5400 5400"})

// Video setup
const threeByThreeVideo = "vid/ThreeByThreeComposition.webm"
playState[threeByThreeVideo] = false
clickLocked[threeByThreeVideo] = false
svg.appendChild(getMP4Video(threeByThreeVideo, "0", "0", "1.0", "1.0", "500", "1730", "1800", "1100", threeByThreeVideo))

const pedalVideo = "vid/Clip Pedal.mp4"
playState[pedalVideo] = false
clickLocked[pedalVideo] = false
svg.appendChild(getMP4Video(pedalVideo, "0", "0", "1.0", "1.0", "30", "510", "500", "400", pedalVideo))

const verbenVideo = "vid/Version 1.2 mit Verben.mp4"
playState[verbenVideo] = false
clickLocked[verbenVideo] = false
svg.appendChild(getMP4Video(verbenVideo, "0", "0", "1.0", "1.0", "3800", "470", "1500", "1100", verbenVideo))

const leoVerbenVideo = "vid/Splittscreen mit Leos Verben.mp4"
playState[leoVerbenVideo] = false
clickLocked[leoVerbenVideo] = false
svg.appendChild(getMP4Video(leoVerbenVideo, "0", "0", "1.0", "1.0", "2200", "490", "1500", "1100", leoVerbenVideo))

// Add text content
fillTextContent(svg, etudePartIComplexityScientist, 540, 140, 700, 33, 73)
fillTextContent(svg, damienText1, 2340, 20, 850, 33, 73)
fillTextContent(svg, etudeTeil1Hanne, 2540, 1510, 500, 33, 73)
fillTextContent(svg, damienText2, 140, 2820, 3630, 33, 73)

// Add to DOM
document.body.appendChild(svg)

// Add event listeners
addEventListenersToTextElements(etudePartIComplexityScientist)
addEventListenersToTextElements(etudeTeil1Hanne)

// Setup video hover and click events
setupVideoHover(verbenVideo)
setupVideoHover(threeByThreeVideo)
setupVideoHover(pedalVideo)
setupVideoHover(leoVerbenVideo)

document.getElementById(verbenVideo).addEventListener("click", () => toggleVideoPlayback(verbenVideo))
document.getElementById(threeByThreeVideo).addEventListener("click", () => toggleVideoPlayback(threeByThreeVideo))
document.getElementById(pedalVideo).addEventListener("click", () => toggleVideoPlayback(pedalVideo))
document.getElementById(leoVerbenVideo).addEventListener("click", () => toggleVideoPlayback(leoVerbenVideo))

// Setup info popup
const infoPopup = document.getElementById("infoPopup")
const exploreButton = document.getElementById("exploreButton")
exploreButton.addEventListener("click", () => {
    infoPopup.classList.add("hidden")
})