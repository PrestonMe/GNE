const app = require('express')()
const port = 3000
const swapiCtrl = require('./swapiCtrl')

app.set('view engine', 'ejs')

app.get('/character/:name', swapiCtrl.getCharacterByName)
app.get('/characters', swapiCtrl.getFiftyCharacters)
app.get('/planetresidents', swapiCtrl.getPlanetResidents)

app.listen(port, function() {
  console.log('app listening on port ' + port)
})
