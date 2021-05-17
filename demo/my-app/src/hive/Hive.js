import React, { useState, useEffect, useRef } from 'react';
import {Feature, FeatureList} from '../feature/Feature'
import { useForm } from "react-hook-form";

import './Hive.css';



const sectionG = (x, y, score, localMax, countAdjacentEdges) => {

  return (
    <>
      <p>{x}, {y}</p>
      {score > -1 ?
        <>
        { !!localMax && localMax > -1 && 
        <p>
          <span>max:{localMax}/{countAdjacentEdges}</span> 
          {/* <span>E:{countAdjacentEdges}</span> */}
        </p>}
        { !!score && score > -1 && <p><span>now: {score}</span></p>}
        </>
        : <span></span>
      }
    </>
  )
}

export default function Hive({
  x, y, isBuilt, isAdjacent, buildGrid, score, localMax, globalMax, isCenterEnabled = true, 
  isEditable = false, editGrid = ()=>{}, removeGrid = ()=>{},
  ...restProps
}) {

  const EDGE_IDS = ['a', 'b', 'c', 'd', 'e', 'f']
  const SECTION_IDS = [...EDGE_IDS, 'g']

  const [isEditFormHidden, setIsEditFormHidden] = useState(true)
  const { register, handleSubmit } = useForm();

  const countAdjacentEdges = (isBuilt || isAdjacent) ? EDGE_IDS.reduce((result, edge) => {
    return result += !!restProps[edge] ? 1:0
  }, 0) : -1

  const EditForm = () => {
   
    const onSubmit = data => {
      setIsEditFormHidden(true)
      // console.log(data)
      const formUpdatedValues = Object.fromEntries(Object.entries(data).filter(([k,v]) => !!v))
      // console.log(data)
      // console.log(formUpdatedValues);
      editGrid(formUpdatedValues)
    }
    
    const options = (sectionId) => FeatureList.map(feature => 
      // <option key={feature} value={feature}>{feature}</option>
      <option key={feature} value={feature} selected={restProps[sectionId] == feature}>{feature}</option>
    )

    // open a form
    return (
      <div className="hive_edit_form" data-is-hidden={isEditFormHidden} >
        <form onSubmit={handleSubmit(onSubmit)}>
          <h2>Edit ({x},{y})</h2>
          <button className="close_button" onClick={() => {setIsEditFormHidden(true)}}><i className="fas fa-window-close"></i></button>
          {SECTION_IDS.map(sectionId => {
            return (
              <div>
                <label htmlFor={`section-select-${sectionId}`}>Choose for {sectionId}: </label>
                <select name="sections" id={`section-select-${sectionId}`} {...register(sectionId)}>
                    <option value="">--Please choose an option--</option>
                    {options(sectionId)}
                </select>
              </div>
            )
          })}
          <input type="submit" value="Submit" className="action_button" /> 
        </form>
        <button className="action_button" onClick={() => {removeGrid()}}>Remove</button>
      </div>
    )
  }

  function editHandler() {
    setIsEditFormHidden(!isEditFormHidden)
  }

  function clickHandler() {
    if (isEditable) {
      return editHandler()
    } 
    else if (buildGrid) {
      return buildGrid({ x, y, ...restProps })
    }
  }

  return (
    <>
      {isAdjacent &&
        <div className="hive"
          data-is-built={isBuilt}
          data-is-adjacent={isAdjacent}
          onClick={clickHandler}
          // onMouseOver={() => {
          //   const t = previewScore && previewScore(x, y)
          //   console.log(t)
          //   setScore(t)
          // }}
          // onMouseOut={() => setScore(initScore)}
        >
          <ul className="hive_body">
            {SECTION_IDS.map(sectionId => {
              const feature = restProps[sectionId]
              const isBorder = sectionId !== 'g'
              const isGlobalBest = localMax > 0 && localMax == globalMax
              const isAllEdgesMatched = localMax > 1 && localMax == countAdjacentEdges
              const isBestNow = localMax > 0 && score == localMax
              return isBorder ? 
                <li className={`hive_border hive_${sectionId} ${feature}`} key={`hive-${sectionId}`}>
                  <div className="nice-diagonal"></div>
                </li>
              : 
                (isCenterEnabled && 
                <li 
                  className={`hive_center hive_${sectionId}`} 
                  data-is-global-best={isGlobalBest}
                  data-is-all-edges-matched={isAllEdgesMatched}
                  data-is-best-now={isBestNow}
                  key={`hive-${sectionId}`}
                >
                  {sectionG(x, y, score, localMax, countAdjacentEdges)}
                </li>)
            })}
          </ul>
        </div>
      }
      {isEditable && EditForm()}
    </>
  );
};

