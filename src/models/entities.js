import { saveState, getState } from '../utils/persist';
const object = require('lodash/fp/object');
const DEFAULT_STATE = {
    repositories: {},
    issues: {},
    labels: {},
    milestones: {},
    comments: {},
};
const NAME = 'entities';

export default {
    name: 'entities',
    state: getState(NAME, DEFAULT_STATE),
    reducers: {
        update(state, payload) {
            const newState = object.merge(state, payload);
            saveState(NAME, newState);
            return newState
        },
    }
}