const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'covid19India.db')
const app = express()
app.use(express.json())

const initilizingDBServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Run At http://localhost/3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initilizingDBServer()
// API1 get list of all states
app.get('/states/', async (request, response) => {
  const getDataQuery = `
        SELECT
        state_id AS stateId,
        state_name AS stateName,
        population 
        FROM 
        state`
  const states = await db.all(getDataQuery)
  response.send(states)
})

// API2 GET Returns a state based on the state ID

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getState = `
    SELECT 
        state_id AS stateId,
        state_name AS stateName,
        population 
    FROM 
    state 
    WHERE state_id = ${stateId};`
  const state = await db.get(getState)
  response.send(state)
})

// POST Create a district in the district table,
app.post('/districts/', async (request, response) => {
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const addDataQuery = `
    INSERT INTO
      district
      (district_name, state_id, cases, cured, active, deaths)
      VALUES
      (?, ?, ?, ?, ?, ?);`

  const dbResponse = await db.run(addDataQuery, [
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  ])
  const districtId = dbResponse.lastID
  response.send('District Successfully Added')
})

// GET Returns a district based on the district ID
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtQuery = `
  SELECT
      district_id AS districtId,
      district_name AS districtName,
      state_id AS stateId, 
      cases,
      cured,
      active,
      deaths
  FROM
  district
  WHERE district_id = ${districtId};`
  const dbResponse = await db.get(districtQuery)
  response.send(dbResponse)
})

// API5 DELETE Deletes a district from the district table based on the district ID

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteQuery = `
      DELETE 
      FROM 
      district
      WHERE district_id = ${districtId}`
  const dbResponse = await db.run(deleteQuery)
  response.send('District Removed')
})

// API6 PUT Updates the details of a specific district based on the district ID

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtDetails = response.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const putDataQuery = `
      UPDATE
          district
      SET
          district_name = ${districtName},
          state_id = ${stateId}, 
          cases = ${cases},
          cured = ${cured},
          active = ${active},
          deaths = ${deaths}
      WHERE district_id = ${districtId};`
  const dbResponse = await db.run(putDataQuery)
  response.send('District Details Updated')
})
