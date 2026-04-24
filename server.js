// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({ extended: true }))

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid()
app.engine('liquid', engine.express())

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

//base url om code wat simpeler te maken, moet wel met ` gebruiken.
const baseUrl = 'https://fdnd-agency.directus.app/items/preludefonds_instruments/'

//route voor de home pagina
app.get('/', async function (request, response) {

  //render home.liquid
  response.render('home.liquid')
})

//route voor het overzicht van de instrumenten
app.get('/instrumenten', async function (request, response) {
  
  //maak een variable voor de params om aan het filter mee te geven
  const params = new URLSearchParams()

  //maak variable soort aan om te filteren op het soort instrument
  const soort = request.query.instrument

  //een if statement om te kijken of het soort instrument wordt eselecteerd in het filter
  if (soort) {
    params.set('filter[instrument][_eq', soort)
  }

  //zet het limiet van items dat geladen wordt op de pagina
  params.set('limit', 25)

  //haal de data uit directus
  const instrumentResponse = await fetch(`${baseUrl}?${params.toString()}`)
  //zet data om naar json
  const instrumentResponseJSON = await instrumentResponse.json()

  //render overzicht.liquid en geef de data mee
  response.render('overzicht.liquid', {
    instrumenten: instrumentResponseJSON.data,
    soort: soort
  })
})

//maak een route aan voor de detail pagina
app.get('/instrumenten/:key', async function (request, response) {

  //params om de key te vinden
  const params = new URLSearchParams() 
  params.set('filter[key]=', request.params.key)


  //haal link op om de key te gebruiken in url en zet om naar json
  const instrumentResponse = await fetch(`${baseUrl}?${params.toString()}`)
  const instrumentResponseJSON = await instrumentResponse.json()

// console.log("hoi")
//   console.log(params)
  console.log(instrumentResponseJSON)

  //render detail.liquid en geef [0] mee aan de extra info zodat hij alleen de eerste uit de array pakt
  response.render('detail.liquid', {
    instrument: instrumentResponseJSON.data[0]
  })
})

//maak een route aan om het instrument aan te passen
app.get('/instrumenten/:key/aanpassen', async function (request, response) {

  //haal link op om de key te gebruiken in url en zet om naar json
  const instrumentResponse = await fetch(`${baseUrl}?filter[key]=${request.params.key}`)
  const instrumentResponseJSON = await instrumentResponse.json()

  // console.log(`${baseUrl}?filter[key]=${request.params.key}`)

  //render aanpassen.liquid  en geef [0] mee aan de extra info zodat hij alleen de eerste uit de array pakt
  response.render('aanpassen.liquid', {
    instrument: instrumentResponseJSON.data[0]
  })
})


//maak een route aan voor de uitleen pagina
app.get('/instrumenten/:key/uitlenen', async function (request, response) {

  //haal link op om de key te gebruiken in url en zet om naar json
  const instrumentResponse = await fetch(`${baseUrl}?filter[key]=${request.params.key}`)
  const instrumentResponseJSON = await instrumentResponse.json()

  //render uitlenen.liquid  en geef [0] mee aan de extra info zodat hij alleen de eerste uit de array pakt
  response.render('uitlenen.liquid', {
    instrument: instrumentResponseJSON.data[0],
    melding: request.query.melding
  })
})

app.post('/instrumenten/:key/uitlenen', async function (request, response) {

try {
  const fetchResponse = await fetch("https://fdnd-agency.directus.app/items/preludefonds_log", {
    method: "POST",
    body: JSON.stringify({
      note: request.body.key + " is uitgeleend aan " + request.body.studentName,
      instrument: request.body.id 
    }),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
  const patchResponse = await fetch(`${baseUrl}${request.body.id}`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({
      status: "Uitgeleend"
    })
  })

  console.log(fetchResponse)

  const fetchResponseJSON = await fetchResponse.json()
  console.log(fetchResponseJSON)
  const patchResponseJSON = await patchResponse.json()
  console.log(patchResponseJSON)

 if (patchResponse.ok) {
      // API zegt: Gelukt! We sturen success=true mee
      response.redirect(303, "/instrumenten/" + request.params.key + "/uitlenen?melding=success#status")
    } else {
      // API zegt: Fout! (bijv. server error of verkeerd ID). We sturen error=true mee
      response.redirect(303, "/instrumenten/" + request.params.key + "/uitlenen?melding=error#status")
    }

  } catch (error) {
    // De fetch zelf is gecrasht (bijv. geen internet). Ook een error dus.
    response.redirect(303, "/instrumenten/" + request.params.key + "/uitlenen?melding=error#status")
  }
})


//maak een route aan voor de inneem pagina
app.get('/instrumenten/:key/innemen', async function (request, response) {

  //haal link op om de key te gebruiken in url en zet om naar json
  const instrumentResponse = await fetch(`${baseUrl}?filter[key]=${request.params.key}`)
  const instrumentResponseJSON = await instrumentResponse.json()

  //render innemen.liquid en geef [0] mee aan de extra info zodat hij alleen de eerste uit de array pakt
  response.render('innemen.liquid', {
    instrument: instrumentResponseJSON.data[0],
    melding: request.query.melding
  })
})

app.post('/instrumenten/:key/innemen', async function (request, response) {

try {
  const logResponse = await fetch("https://fdnd-agency.directus.app/items/preludefonds_log", {
    method: "POST",
    headers: { 
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({
      note: "Inname " +request.body.key + " staat: " + request.body.staat + ". Opmerking: " + request.body.opm,
      instrument: request.body.id 
    })
  })

  const patchResponse = await fetch(`${baseUrl}${request.body.id}`, {
    method: "PATCH",
    headers: { 
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({
      status: "Beschikbaar"
    })
  })
  // console.log(patchResponse)

  // log de resultaten in je terminal voor controle
  // console.log('Inname gelukt voor ID:', request.body.id)

 if (patchResponse.ok) {
      // API zegt: Gelukt! We sturen success=true mee
      response.redirect(303, "/instrumenten/" + request.params.key + "/innemen?melding=success#status")
    } else {
      // API zegt: Fout! (bijv. server error of verkeerd ID). We sturen error=true mee
      response.redirect(303, "/instrumenten/" + request.params.key + "/innemen?melding=error#status")
    }

  } catch (error) {
    // De fetch zelf is gecrasht (bijv. geen internet). Ook een error dus.
    response.redirect(303, "/instrumenten/" + request.params.key + "/innemen?melding=error#status")
  }
})


//maak een route aan voor de schade pagina
app.get('/instrumenten/:key/schade', async function (request, response) {

  //haal link op om de key te gebruiken in url en zet om naar json
  const instrumentResponse = await fetch(`${baseUrl}?filter[key]=${request.params.key}`)
  const instrumentResponseJSON = await instrumentResponse.json()

  //render schade.liquid en geef [0] mee aan de extra info zodat hij alleen de eerste uit de array pakt
  response.render('schade.liquid', {
    instrument: instrumentResponseJSON.data[0],
    melding: request.query.melding
  })
})

app.post('/instrumenten/:key/schade', async function (request, response) {

try {
  const patchResponse = await fetch(`${baseUrl}${request.body.id}`, {
    method: "PATCH",
    headers: { 
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({
      status: "In Reparatie"
    })
 })
 if (patchResponse.ok) {
      // API zegt: Gelukt! We sturen success=true mee
      response.redirect(303, "/instrumenten/" + request.params.key + "/schade?melding=success#status")
    } else {
      // API zegt: Fout! (bijv. server error of verkeerd ID). We sturen error=true mee
      response.redirect(303, "/instrumenten/" + request.params.key + "/schade?melding=error#status")
    }

  } catch (error) {
    // De fetch zelf is gecrasht (bijv. geen internet). Ook een error dus.
    response.redirect(303, "/instrumenten/" + request.params.key + "/schade?melding=error#status")
  }
})


//route voor de admin pagina
app.get('/admin', async function (request, response) {

  //render home.liquid
  response.render('admin.liquid')
})

//route voor het toevoegen van een nieuw instrument
app.get('/admin/nieuw', async function (request, response) {
  
  //maak een variable voor de params
  const params = new URLSearchParams()

  //haal de data uit directus
  const instrumentResponse = await fetch(`${baseUrl}?${params.toString()}`)
  //zet data om naar json
  const instrumentResponseJSON = await instrumentResponse.json()

  //render overzicht.liquid en geef de data mee
  response.render('nieuw.liquid', {
    instrumenten: instrumentResponseJSON.data,
    soort: soort
  })
})


app.use((req, res, next) => {

  res.status(404).render('error.liquid')
})

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`Daarna kun je via http://localhost:${app.get('port')}/ jouw interactieve website bekijken.\n\nThe Web is for Everyone. Maak mooie dingen 🙂`)
})