import { userAuth, getViewer } from '../services/github';
import { getSearchCode } from '../utils/urlSearchParser';
import { USER_AUTH } from '../commons/const';

const object = require('lodash/fp/object');

export default {
    name: 'user',
    state: {
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
    },
    reducers: {
        update(state, payload) {
            return object.merge(state, payload)
        },
    },
    effects: (dispatch) => ({
        async getAuthToken(_, rootState) {
            const code = getSearchCode();
            const userCache = localStorage.getItem(USER_AUTH);
            if (userCache ) {
                const { 
                    access_token,
                    token_type,
                    scope,
                } = JSON.parse(userCache);
                const user = getViewer(`${token_type} ${access_token}`)
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
                if (!rootState.user.loading) {
                    await dispatch.user.update({
                        loading: true,
                    })
                }
                const oauth = await userAuth(code);
                if (oauth && oauth.access_token) {
                    localStorage.setItem(USER_AUTH, JSON.stringify(oauth));
                    const user = getViewer(`${oauth.token_type} ${oauth.access_token}`)
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
                } else {
                    await dispatch.user.update({
                        loading: false,
                    })
                }
            }
        }
    })
}