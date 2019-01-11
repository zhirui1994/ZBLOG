import * as githubServices from '../services/github'

const object = require('lodash/fp/object');

export default {
    name: 'repository',
    state: {
        result: '',
    },
    reducers: {
        update(state, payload) {
            return object.merge(state, payload);
        }
    },
    effects: (dispatch) => ({
        async initIndex() {
            const response = await githubServices.initIndex()
            if (response) {
                await dispatch.entities.update(response.entities);
                await dispatch.repository.update({
                    result: response.result
                });
            }
        }
    })
}