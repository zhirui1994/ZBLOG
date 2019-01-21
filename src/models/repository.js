import * as githubServices from '../services/github'

const object = require('lodash/fp/object');

export default {
    name: 'repository',
    state: {
        result: '',
        loading: true,
        searchParams: {
            milestone: '*',
            labels: [],
            query: '', 
        }
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
                currentRepository &&
                currentRepository.labels &&
                currentRepository.labels.nodes.length &&
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
        },
        async searchIssues(payload, rootState) {
            const { milestone, labels, query } = payload;
            await dispatch.repository.update({
                searchParams: {
                    milestone,
                    labels,
                    query,
                }
            })
            const response = await githubServices.searchIssues({
                milestone,
                labels,
                query,
            });
            if (response) {
                const result = rootState.repository.result;
                const currentRepository = rootState.entities.repositories[result];
                if (currentRepository) {
                    currentRepository.issues = {
                        pageInfo: response.pageInfo,
                        totalCount: response.issueCount,
                        nodes: response.nodes,
                    }
                    dispatch.entities.update({
                        repositories: {
                            [result]: currentRepository,
                        },
                        ...response.entities,
                    })
                }
            }
        }
    })
}