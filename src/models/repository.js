import * as githubServices from '../services/github'

const object = require('lodash/fp/object');

export default {
    name: 'repository',
    state: {
        result: '',
        loading: true,
    },
    reducers: {
        update(state, payload) {
            return object.merge(state, payload);
        }
    },
    effects: (dispatch) => ({
        async initIndex(_, rootState) {
            if (!rootState.repository.loading) {
                await dispatch.repository.update({
                    loading: true,
                });
            }
            const response = await githubServices.initIndex()
            if (response) {
                await dispatch.entities.update(response.entities);
                await dispatch.repository.update({
                    result: response.result,
                    loading: false,
                });
            }
        },
        async getSingleIssue(number, rootState) {
            if (!rootState.repository.loading) {
                await dispatch.repository.update({
                    loading: true,
                });
            }
            const response = await githubServices.getSingleIssue(number)
            if (response) {
                await dispatch.entities.update(response.entities);
                await dispatch.repository.update({
                    result: response.result,
                    loading: false,
                })
            }
        },
        async closeCurrentIssue(_, rootState) {
            const result = rootState.repository.result;
            const currentRepository = rootState.entities.repositories[result];
            if (currentRepository) {
                currentRepository.issue = undefined;
                const newEntities = {
                    repositories: {
                        [result]: currentRepository
                    }
                };
                await dispatch.entities.update(newEntities);
            }
        },
        async initEditor(_, rootState) {
            const result = rootState.repository.result;
            const currentRepository = rootState.entities.repositories[result];
            if(
                currentRepository.issues &&
                currentRepository.issues.nodes.length &&
                currentRepository.milestones &&
                currentRepository.milestones.nodes.length
            ) {
                return;
            }
            if (!rootState.repository.loading) {
                await dispatch.repository.update({
                    loading: true,
                });
            }
            const response = await githubServices.initEditor()
            if (response) {
                await dispatch.entities.update(response.entities);
                await dispatch.repository.update({
                    result: response.result,
                    loading: false,
                });
            }
        } 
    })
}