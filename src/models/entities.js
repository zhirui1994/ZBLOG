const object = require('lodash/fp/object');

export default {
    name: 'entities',
    state: {
        repositories: {},
        issues: {},
        labels: {},
        milestones: {},
    },
    reducers: {
        update(state, payload) {
            return object.merge(state, payload)
        }
    }
}