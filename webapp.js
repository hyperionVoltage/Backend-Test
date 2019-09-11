const express = require('express')
const fs = require('fs')
const rateLimit = require('express-rate-limit')
const app = express()
const port = 8000

/*
const limiter = rateLimit({
    windowMs: 1000,
    max: 2
})

app.use(limiter)
*/

var words = []
var requests = 0

let startTime
let endTime
let lastUse = Date.now()

fs.readFile('words_clean.txt', 'utf8', (err, data) => {
    if (err) {
        console.log('Error: ' + err)
    }
    let splitted = data.toString().split("\n")
    for (let i = 0; i < splitted.length; i++) {
        words[i] = splitted[i]
    }
})

app.get('/api/v1/similar', (req, res) => {
    if (req.query.word != undefined && req.query.word.length != 0) {
        let singleWordFlag = req.query.word.toString().split(' ')
        if (singleWordFlag.length == 1) {
            requests++
            let premutations = findPremutations(req.query.word)
            res.json(getReturnJson(premutations))
        } else {
            res.send("Please enter a single word")
        }
    } else {
        res.send("Please enter a correct word")
    }
})

app.get('/api/v1/stats', (req, res) => {
    let returnJson = {
        totalWords: words.length,
        totalRequests: requests,
        avgProcessingTimeNs: getAverageHandleTime()
    }
    lastUse = Date.now()
    res.json(returnJson)
})

function findPremutations(string) {
    let premutations = []
    let premutationCounter = 0;
    let sortedString = sortString(string)
    for (let i = 0; i < words.length; i++) {
        givenString = sortString(words[i])
        if (string != words[i]) {
            let isEquals = sortedString.length == givenString.length && sortedString.every((element, index) => {
                return element === givenString[index]
            })
            if (isEquals) {
                premutations[premutationCounter] = words[i]
                premutationCounter++
            }
        }
    }
    lastUse = Date.now()
    endTime = Date.now()
    return premutations
}

function sortString(string) {
    let stringedArray = string.split('')
    return stringedArray.sort()
}

function getReturnJson(premutationArray) {
    return arrayJson = {
        similar: premutationArray
    }
}

function getAverageHandleTime() {
    startTime = Date.now()
    findPremutations(words[Math.floor(Math.random() * words.length)])
    return (endTime - startTime)
}

app.listen(port, () => {
    console.log('Example app listening to port ' + port)
})