import { userAuth, getViewer, addComment, getAuthUser } from '../services/github';
import { getSearchCode } from '../utils/urlSearchParser';
import { USER_AUTH } from '../commons/const';
import { saveState, getState } from '../utils/persist';

const object = require('lodash/fp/object');
const DEFAULT_STATE = {
    loading: false,
    auth: false,
    accessToken: '',
    scope: '',
    tokenType: '',
    viewer: {
        email: '',
        id: '',
        login: '',
        name: '',
        url: '',
        avatarUrl: ''
    }
};
const NAME = 'user';

export default {
    name:NAME,
    state: getState(NAME, DEFAULT_STATE),
    reducers: {
        update(state, payload) {
            const newState = object.merge(state, payload);
            saveState(NAME, newState);
            return newState;
        },
    },
    effects: (dispatch) => ({
        async getAuthToken(_, rootState) {
            const code = getSearchCode();
            const userCache = localStorage.getItem(USER_AUTH);
            if (!code && !userCache) {
                return;
            }

            if (!rootState.user.loading) {
                await dispatch.user.update({
                    loading: true,
                })
            }

            if (userCache ) {
                const { 
                    access_token,
                    token_type,
                    scope,
                } = JSON.parse(userCache);
                const user = await getViewer(`${token_type} ${access_token}`)
                if (user) {
                    await dispatch.user.update({
                        accessToken: access_token,
                        tokenType: token_type,
                        scope: scope,
                        auth: true,
                        loading: false,
                        viewer: user,
                    })
                }
            } else if (code) {
                const oauth = await userAuth(code);
                if (oauth && oauth.access_token) {
                    localStorage.setItem(USER_AUTH, JSON.stringify(oauth));
                    const user = await getViewer(`${oauth.token_type} ${oauth.access_token}`)
                    if (user) {
                        await dispatch.user.update({
                            accessToken: oauth.access_token,
                            tokenType: oauth.token_type,
                            scope: oauth.scope,
                            auth: true,
                            loading: false,
                            viewer: user,
                        })
                    }
                }
            }

            await dispatch.user.update({
                loading: false,
            })
        },
        async addComment({id, content, callback}, rootState) {
            if (!rootState.user.accessToken) {
                return;
            }

            const token = `${rootState.user.tokenType} ${rootState.user.accessToken}`;
            const comment = await addComment({id, content, token});
            if (comment) {
                const issuesMap = rootState.entities.issues;
                const commentIssue = issuesMap[id];
                commentIssue.comments.nodes.push(comment.result)
                await dispatch.entities.update({
                    issues: {
                        [id]: commentIssue,
                    },
                    ...comment.entities,
                })
                typeof callback === 'function' && callback();
            }
        },
        async getAuthUser(params, rootState) {
            if (params && params.username && params.password) {
                if (!rootState.user.loading) {
                    await dispatch.user.update({
                        loading: true,
                    });
                }
                const user = await getAuthUser(params);
                if (user) {
                    await dispatch.user.update({
                        auth: true,
                        loading: false,
                        viewer: user,
                        username: params.username,
                        password: params.password,
                    })
                } else {
                    await dispatch.user.update({
                        loading: false,
                    });
                }
            }
        }
    })
}