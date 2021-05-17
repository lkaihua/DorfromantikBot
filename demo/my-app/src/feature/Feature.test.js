import Feature, { 
    featureToArray,
    currentFeatureSimilarity,
    maxFeatureSimilarity,
} from "./Feature";


test('featureToArray', () => {
    expect(featureToArray({
        a: Feature.land
    })).toEqual(('1-----').split(""))

    expect(featureToArray({
        a: Feature.land,
        c: Feature.tree
    })).toEqual(('1-2---').split(""))

})

test('currentFeatureSimilarity', () => {

    expect(currentFeatureSimilarity({
        a: Feature.tree,
    }, {
        b: Feature.tree,
    })).toBe(0)

    expect(currentFeatureSimilarity({
        a: Feature.tree,
        b: Feature.river,
        c: Feature.river,
    }, {
        a: Feature.tree,
        c: Feature.any
    })).toBe(2)
})


test('maxFeatureSimilarity', () => {

    expect(maxFeatureSimilarity({
        a: Feature.tree,

    }, {
        a: Feature.tree,
        b: Feature.land,
        c: Feature.land,
        d: Feature.land,
        e: Feature.land,
        f: Feature.land,
    })).toBe(1)

    expect(maxFeatureSimilarity({
        a: Feature.tree,
        f: Feature.tree
    }, {
        a: Feature.tree,
        b: Feature.land,
        c: Feature.land,
        d: Feature.land,
        e: Feature.land,
        f: Feature.tree,
    })).toBe(2)

    expect(maxFeatureSimilarity({
        c: Feature.tree,
        d: Feature.tree,
    }, {
        a: Feature.tree,
        b: Feature.land,
        c: Feature.land,
        d: Feature.land,
        e: Feature.land,
        f: Feature.tree,
    })).toBe(2)

    expect(maxFeatureSimilarity({
        c: Feature.tree,
        d: Feature.tree,
    }, {
        a: Feature.tree,
        b: Feature.land,
        c: Feature.land,
        d: Feature.land,
        e: Feature.land,
        f: Feature.tree,
    })).toBe(2)

    expect(maxFeatureSimilarity({
        b: Feature.any,
        c: Feature.tree,
        d: Feature.tree,
    }, {
        a: Feature.tree,
        b: Feature.land,
        c: Feature.land,
        d: Feature.land,
        e: Feature.land,
        f: Feature.tree,
    })).toBe(3)

    expect(maxFeatureSimilarity({
        a: Feature.rail,
        b: Feature.tree,
        c: Feature.land,
        d: Feature.farm,
        e: Feature.house,
        f: Feature.river,
    }, {
        a: Feature.tree,
        b: Feature.land,
        c: Feature.farm,
        d: Feature.house,
        e: Feature.river,
        f: Feature.rail,
    })).toBe(6)

    expect(maxFeatureSimilarity({
        b: Feature.any,
        c: Feature.land,
    }, {
        a: Feature.farm,
        b: Feature.tree,
        c: Feature.farm,
        d: Feature.any,
        e: Feature.any,
        f: Feature.land,
    })).toBe(2)
})