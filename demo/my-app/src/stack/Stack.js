import Hive from '../hive/Hive';
import './Stack.css';

// Stack is floating on the right bottom
// And shows the next tile

export default function Stack({nextGrid, editGrid}) {

  return (
    <div className="stack">
     <ul className="grid-container">
      <li className="cell_container hive_container">
        <Hive x={'NA'} y={'NA'} isBuilt={true} isAdjacent={true} isEditable={true} isCenterEnabled = {false}
          editGrid={editGrid}
          a = {nextGrid.a}
          b = {nextGrid.b}
          c = {nextGrid.c}
          d = {nextGrid.d}
          e = {nextGrid.e}
          f = {nextGrid.f}
          g = {nextGrid.g}
        />
        </li>
      </ul>
    </div>
  )
}