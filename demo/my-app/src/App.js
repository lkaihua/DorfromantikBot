import React, { useState, useEffect, useRef, useReducer, useMemo, useCallback } from 'react';
import './App.css';
import Hive from './hive/Hive';
import Feature, {maxFeatureSimilarity, currentFeatureSimilarity} from './feature/Feature'
import Stack from './stack/Stack';
import { emptyGrid, randomGrid } from './util/randomGrid'
import useEventListener from '@use-it/event-listener'


const CLOCKWISE_ROTATE = ['f'];
const ANTI_CLOCKWISE_ROTATE = ['r'];

const w = 80;
const h = 80;
// const numGrids = w * h;

function range(x) { return [...Array(x).keys()] }

function setCssRootVariable(key, value) {
  document.documentElement.style.setProperty(key, value)
}

function getId(x, y) { return `(${x},${y})` }

// use bits to describe each grid, from low to high:
// 1. permission to interact
// 2. visible
// 3. adjacent to a built one (distance to the nearest built grid is 1)
// 4. suitable for next building action
// 5. already built
// 
// - the inital grid can be described: 10011
// - a grid with a given building but is very far away and hidden for now: 10001
// - the empty grids around a built one: 00111
// - the suitable grids 01111
// 
// todo: know which empty grids get the highest score for next building!




function getNeighboursMap(state, payload, w, h) {
  // const neighbours = []
  const { x, y, a, b, c, d, e, f } = payload
  const id = getId(x, y)
  return [
    { x: x - 1, y: y - 1, c: f },
    { x: x, y: y - 2, d: a },
    { x: x + 1, y: y - 1, e: b },
    { x: x + 1, y: y + 1, f: c },
    { x: x, y: y + 2, a: d },
    { x: x - 1, y: y + 1, b: e },
  ]
    .filter(cell => cell.x >= 0 || cell.x <= w - 1 || cell.y >= 0 || cell.y <= 2 * h - 1)
    .filter(cell => state[getId(cell.x, cell.y)]?.isBuilt != true)  // filter out built cells
    .reduce((acc, cell) => {
      acc[getId(cell.x, cell.y)] = {
        ...state[getId(cell.x, cell.y)], 
        ...cell,
        isAdjacent: true,
      }
      // console.log(state[getId(cell.x, cell.y)], acc)
      return acc;
    }, {});
}




function App() {
  setCssRootVariable('--grid-w', w)
  setCssRootVariable('--grid-h', h)
  setCssRootVariable('--cell-w', '100px')
  setCssRootVariable('--cell-h', '100px')

  function nextGridReducer(state, action) {
    const newState = {}
    switch (action.type) {
      case 'sync':
        const tile = action.payload.tile
        const timestamp = action.payload.timestamp
        if (timestamp > state.timestamp) {
          newState['f'] = tile[0]
          newState['a'] = tile[1]
          newState['b'] = tile[2]
          newState['e'] = tile[3]
          newState['d'] = tile[4]
          newState['c'] = tile[5]
          newState['timestamp'] = timestamp
        }
        return {
          ...state,
          ...newState,
        }

      case 'update':
        return {
          ...state,
          ...action.payload,
        }  

      case 'reset':
        return {
          ...state,
          ...randomGrid(),
          timestamp: 0,
        }
      case 'rotate-clockwise':
        const clockwiseSectionIds = ['a', 'b', 'c', 'd', 'e', 'f', 'a']
        for(let i = 1, l = clockwiseSectionIds.length; i < l; i ++) {
          newState[clockwiseSectionIds[i]] = state[clockwiseSectionIds[i - 1]]
        }
        return {
          ...state,
          ...newState,
        }
      case 'rotate-anti-clockwise':
        const antiClockSectionIds = ['a', 'b', 'c', 'd', 'e', 'f', 'a']
        for(let i = 0, l = antiClockSectionIds.length; i < l - 1; i ++) {
          newState[antiClockSectionIds[i]] = state[antiClockSectionIds[i + 1]]
        }
        return {
          ...state,
          ...newState,
        }
      default:
        return new Error();
    }
  }


  function allGridsReducer(state, action) {
    let payload
    let id
    let newState
    switch (action.type) {
      case 'build':
        payload = action.payload
        id = getId(payload.x, payload.y);
        if (state[id]?.isBuilt) {
          return state
        }
        if (state[id] && !state[id].isAdjacent) {
          return state
        }
        const neighbours = getNeighboursMap(state, payload, w, h)
        // console.table(neighbours)

        newState = {
          ...state,
          [id]: { ...state[id], ...payload, isBuilt: true },
          ...neighbours,
        };
        console.log(newState)
        return newState

      case 'update':
        payload = action.payload
        id = getId(payload.x, payload.y);
        const neighbours_update = getNeighboursMap(state, payload, w, h)
        return {
          ...state,
          [id]: { ...state[id], ...payload },
          ...neighbours_update,
        }
      
      case 'remove':
        payload = action.payload
        id = getId(payload.x, payload.y);
        const removePayload = {a: undefined, b: undefined, c: undefined, d: undefined, e: undefined, f:undefined, g:undefined, 
          isBuilt: false, isEditable: false}
        const neighbours_removed = getNeighboursMap(state, removePayload, w, h)
        return {
          ...state,
          [id]: { ...state[id],  ...removePayload},
          ...neighbours_removed
        }
      case 'init-center':

        const y = Math.floor(h) // vertical step is 2
        const x = Math.floor(w / 2)
        return allGridsReducer(state, {
          type: 'build',
          payload: {
            x, y,
            isAdjacent: true,
            isBuilt: false,
            // ...randomGrid(),
            ...emptyGrid,
          }
        });

      default:
        // return state;
        return new Error()
    }
  }

  function calculateAdjGrid(allGrids, nextGrid) {
    return Object.entries(allGrids).reduce((result, entry) => {
      if (entry[1].isAdjacent && !entry[1].isBuilt) {
        const sim = maxFeatureSimilarity(entry[1], nextGrid)
        result[0][entry[0]] = sim
        result[1] = Math.max(result[1], sim)
      }
      return result
    }, [{}, 0])
  }



  const initNextGrid = {timestamp: 0}
  const initAllGrids = {}
  const [nextGrid, dispatchNextGrid] = useReducer(nextGridReducer, initNextGrid)
  const [allGrids, dispatchAllGrids] = useReducer(allGridsReducer, initAllGrids)
  const [syncNextGrid, setSyncNextGrid] = useState(false)

  const [adjGrids, adjMax] = useMemo(() => calculateAdjGrid(allGrids, nextGrid), [allGrids, nextGrid])
  const buildGrid = useCallback((payload) => dispatchAllGrids({
    type: "build", 
    payload: {...payload, ...nextGrid},
  }), [dispatchAllGrids, nextGrid])

  const editGrid = (x, y, currGrid) => (payload) => dispatchAllGrids({
    type: "update",
    payload: {x, y, ...currGrid, ...payload}
  })

  const removeGrid = (x, y) => () => dispatchAllGrids({
    type: "remove",
    payload: {x, y}
  })

  // const previewScore = useCallback((x, y) => currentFeatureSimilarity(allGrids[getId(x,y)], nextGrid), [nextGrid])
  const previewScore = useCallback((currGrid) => currentFeatureSimilarity(currGrid, nextGrid), [nextGrid])
  
  window.allGrids = allGrids
  window.nextGrid = nextGrid
  window.adjGrids = adjGrids
  window.currentFeatureSimilarity = currentFeatureSimilarity

  useEffect(() => {
    if (syncNextGrid) {
      const intervalId = setInterval(() => {
        fetch("http://127.0.0.1:8000/read")
        .then(response => response.json())
        .then(data => {
          // console.log(data)
          dispatchNextGrid({type: "sync", payload: data})
        })
      }, 500)
      return () => clearInterval(intervalId); //This is important
    }
  }, [syncNextGrid])

  useEffect(() => {
    dispatchAllGrids({ type: 'init-center' })
    dispatchNextGrid({ type: 'reset' })
  }, [])

  useEventListener('keydown', function({ key }) {
    // console.log(key)
    CLOCKWISE_ROTATE.includes(key) && dispatchNextGrid({
      type: 'rotate-clockwise'
    })
    ANTI_CLOCKWISE_ROTATE.includes(key) && dispatchNextGrid({
      type: 'rotate-anti-clockwise'
    })

  })

  return (
    <div className="App">
      <div className="App-header">
        <ul className="grid-container">
          {
            range(h).map(y => {
              return range(w).map(x => {
                // cell_y will ease the calculation of neighbourhood distance
                // since the hamming distance between two neighour grid is always 2
                //
                //     (7,1)
                //(6,2)     (8,2)
                //     (7,3)
                //(6,4)     (8,4)
                //     (7,5)
                //
                const cellY = (x % 2 == 0) ? 2 * y : (2 * y + 1);
                const id = getId(x, cellY);
                const hive = allGrids[id];
                const score = (hive && !hive.isBuilt) ? previewScore(hive) : -1
                return (
                  <li className="hive_container"
                    key={`hive-container-${x}-${y}`}
                    data-is-odd-col={x % 2 == 1}
                  >
                    <Hive x={x} y={cellY}
                      key={`hive-${x}-${cellY}`}
                      isBuilt={!!hive?.isBuilt}
                      buildGrid={buildGrid}
                      isEditable={!!hive?.isBuilt}
                      editGrid={editGrid(x, cellY, hive)}
                      removeGrid={removeGrid(x, cellY)}
                      isAdjacent={!!hive?.isAdjacent}
                      a={hive?.a}
                      b={hive?.b}
                      c={hive?.c}
                      d={hive?.d}
                      e={hive?.e}
                      f={hive?.f}
                      g={hive?.g}
                      score={score}
                      localMax={adjGrids[id]}
                      globalMax={adjMax}
                    />
                  </li>
                );
              });
            })
          }
        </ul>
      </div>
      <div className="App-siderbar">

        <button className="refresh_grid" onClick={() => {
          setSyncNextGrid(!syncNextGrid)
        }}> <i className={`fas fa-toggle-${syncNextGrid ? 'on' : 'off'} fa-flip-vertical `}></i> Recognition {syncNextGrid ? 'on' : 'off'} </button>

        <Stack nextGrid={nextGrid} editGrid={(newNextGrid) => {
          dispatchNextGrid({
            type: 'update', payload: newNextGrid
          })
        }}/>

        <div className="App-menu">
          <button className="refresh_grid" onClick={() => {
            dispatchNextGrid({
              type: 'reset'
            })
          }}> <i className="fas fa-plus"></i> </button>

          <button className="refresh_grid" onClick={() => {
            dispatchNextGrid({
              type: 'rotate-clockwise'
            })
          }}> <i className="fas fa-undo fa-flip-vertical "></i> F{/* ↩ rotate */}</button>

          <button className="refresh_grid" onClick={() => {
            dispatchNextGrid({
              type: 'rotate-anti-clockwise'
            })
          }}>  <i className="fas fa-undo fa-flip-vertical fa-flip-horizontal"></i> R{/* ↪ rotate */} </button>
        </div>
      </div>

      <div className="App-float">

      </div>
    </div>
  );
}

export default App;
