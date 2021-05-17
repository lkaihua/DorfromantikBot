import Feature, {FeatureList} from "../feature/Feature";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export const emptyGrid = Object.freeze({
  a: Feature.land, 
  b: Feature.land, 
  c: Feature.land, 
  d: Feature.land, 
  e: Feature.land, 
  f: Feature.land, 
  g: Feature.land,
})

export function randomGrid() {
  return ['a', 'b', 'c', 'd', 'e', 'f', 'g'].reduce((result, sectionId) => {
    result[sectionId] = FeatureList[getRandomInt(FeatureList.length)];
    return result;
  }, {})
}
