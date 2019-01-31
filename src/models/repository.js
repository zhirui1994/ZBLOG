import * as githubServices from '../services/github'
import { saveState, getState } from '../utils/persist';

const object = require('lodash/fp/object');
const DEFAULT_STATE = {
    result: '',
    loading: true,
    searchParams: {
        milestone: '*',
        labels: [],
        query: '', 
    }
};
const NAME = 'repository';

export default {
    name: NAME,
    state: getState(NAME, DEFAULT_STATE),
    reducers: {
        update(state, payload) {
            const newState = object.merge(state, payload);
            saveState(NAME, newState);
            return newState;
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
        async initEditor(number, rootState) {
            const result = rootState.repository.result;
            const currentRepository = rootState.entities.repositories[result];
            const hasLabelsAndMilestones = currentRepository &&
                currentRepository.labels &&
                currentRepository.labels.nodes.length &&
                currentRepository.milestones &&
                currentRepository.milestones.nodes.length;
            const hasCurrentIssueBody = !number || (
                currentRepository &&
                currentRepository.issue &&
                rootState.entities.issues[currentRepository.issue] &&
                rootState.entities.issues[currentRepository.issue].body);
            if (hasLabelsAndMilestones && hasCurrentIssueBody) {
                return;
            }
            if (!rootState.repository.loading) {
                await dispatch.repository.update({
                    loading: true,
                });
            }
            const response = await githubServices.initEditor(number, hasLabelsAndMilestones)
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
        },
        async createIssue(payload, rootState) {
            const response =  await githubServices.createIssue(payload);
            if (response && response.result) {
                const currentRepository = rootState.entities.repositories[rootState.repository.result];
                currentRepository.issue = response.result;
                await dispatch.entities.update({
                    ...response.entities,
                    repositories: {
                        [rootState.repository.result]: currentRepository,
                    }
                });
                typeof payload.callback === 'function' && payload.callback(`/article/${response.entities.issues[response.result].number}`)
            }
        },
        async editIssue(payload, rootState) {
            const response =  await githubServices.editIssue(payload);
            if (response && response.result) {
                const currentRepository = rootState.entities.repositories[rootState.repository.result];
                currentRepository.issue = response.result;
                await dispatch.entities.update({
                    ...response.entities,
                    repositories: {
                        [rootState.repository.result]: currentRepository,
                    }
                });
                typeof payload.callback === 'function' && payload.callback(`/article/${response.entities.issues[response.result].number}`)
            }
        },
    })
}