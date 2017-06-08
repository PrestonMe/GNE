const rp = require('request-promise')
const baseUrl = 'http://swapi.co/api'

module.exports = {
  getCharacterByName: (req, res, next) => {
    let name = req.params.name.toLowerCase();
    getCharacter(name, `${baseUrl}/people/?page=1`).then(character => {
      // console.log(character.name)
      res.render('character', {
        name: character.name,
        height: character.height,
        mass: character.mass,
        hair_color: character.hair_color,
        skin_color: character.skin_color,
        eye_color: character.eye_color,
        birth_year: character.birth_year,
        gender: character.gender
      })
    })
  },
  getFiftyCharacters: (req, res, next) => {
    getCharacters(`${baseUrl}/people/?page=1`, 50).then(characters => {
      if(req.query.sort) {
        if(sort[req.query.sort]) {
          characters = sort[req.query.sort](characters)
        }
        res.json(characters)
      } else {
        res.json(characters)
      }
    })
  },
  getPlanetResidents: (req, res, next) => {
    getCharacters(`${baseUrl}/people/?page=1`).then(characters => {
      getPlanets(`${baseUrl}/planets/?page=1`).then(planets => {
        let planetResidents = [];
        for(let i = 0; i < planets.length; i++) {
          let obj = {
            [planets[i].name]: []
          };
          for(let j = 0; j < characters.length; j++) {
            if(planets[i].residents.indexOf(characters[j].url) !== -1) {
              obj[planets[i].name].push(characters[j].name)
            }
          }
          planetResidents.push(obj)
        }
        res.json(planetResidents)
      })
    })
  }
}

let sort = {
  name: function(characters) {
      return characters.sort((a, b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      })
  },
  mass: function(characters) {
    return characters.sort((a, b) => {
      if(a.mass === 'unknown') return 1;
      if(b.mass === 'unknown') return -1;

      // This is all Jabbas Fault
      if(isNaN(a.mass * 1)) a.mass = a.mass.split(',').join('');
      if(isNaN(b.mass * 1)) b.mass = b.mass.split(',').join('');

      return a.mass - b.mass
    })
  },
  height: function(characters) {
    return characters.sort((a, b) => {
      if(a.height === 'unknown') return 1;
      if(b.height === 'unknown') return -1;
      return a.height - b.height;
    })
  }
}

function getCharacter(name, url) {
  let character;
  return rp(url)
    .then(res => {
      let { results, next } = JSON.parse(res)
      for(let j = 0; j < results.length; j++) {
        if(results[j].name.toLowerCase().indexOf(name) !== -1) {
          character = results[j]
          break;
        }
      }
      return character ? character : next ? getCharacter(name, next) : 'not found'
    })
}

function getCharacters(url, limit, characters = []) {
  return rp(url)
    .then(res => {
     let { results, next } = JSON.parse(res)
     characters.push(...results)

     if(limit && characters.length === limit) return characters;
     else if (limit) return getCharacters(next, limit, characters);
     else if (next) return getCharacters(next, null, characters);
     else return characters;
  })
}

function getPlanets(url, planets = []) {
  return rp(url)
    .then(res => {
      let { results, next } = JSON.parse(res)
      planets.push(...results)

      if(next) return getPlanets(next, planets);
      else return planets;
    })
}
