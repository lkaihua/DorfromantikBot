import './Feature.css';

function makeStringEnum(arr) {
    const dict = {}
    for (const val of arr) {
        dict[val] = val
    }
    return Object.freeze(dict);
}

export const FeatureList = [
    // 'any',
    'land',
    'tree',
    'farm',
    'house',
    'river',
    'rail',
    // 'undefined',
]

const Feature = makeStringEnum(FeatureList)

export const featureToArray = (edges) => [
        FeatureList.indexOf(edges?.a),
        FeatureList.indexOf(edges?.b),
        FeatureList.indexOf(edges?.c),
        FeatureList.indexOf(edges?.d),
        FeatureList.indexOf(edges?.e),
        FeatureList.indexOf(edges?.f),
    ].map(edge => edge == -1 ? '-' : `${edge}`)


// don't consider any rotation, compare edge to edge
export const currentFeatureSimilarity = (candidate, next) => {
    // console.debug(candidate, next)
    let score = 0
    const candArr = Array.isArray(candidate) ? candidate : featureToArray(candidate)
    const nextArr = Array.isArray(next) ? next: featureToArray(next)
    // console.debug(candArr, nextArr)

    // const anyIndex = `${FeatureList.indexOf('any')}`
    // for(let i = 0; i < 6; i ++) {
    //     if (candArr[i] == anyIndex) {
    //         score += 1
    //     }
    //     else if(candArr[i] != '-' && (nextArr[i] == anyIndex || candArr[i] == nextArr[i])) {
    //         score += 1
    //     }
    // }

    // No `any` feature
    for(let i = 0; i < 6; i ++) {
        if(candArr[i] != '-' && candArr[i] == nextArr[i]) {
            score += 1
        }
    }
    return score
}

// considering all rotations, return the best fit
export const maxFeatureSimilarity = (candidate, next) => {
    const candArr = featureToArray(candidate)
    const tmp = featureToArray(next)
    const nextArr = [...tmp, ...tmp]

    let score = 0
    for (let i = 0; i < 6; i ++) {
        score = Math.max(score, currentFeatureSimilarity(candArr, nextArr))
        nextArr.shift()
    }
    return score
}

export default Feature;