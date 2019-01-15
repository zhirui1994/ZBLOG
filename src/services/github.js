import axios from 'axios';
import { normalize } from 'normalizr';
import config from '../commons/config';
import { repository } from '../commons/schemas';
import getToken from '../utils/getToken';

export async function initIndex() {
    return axios.post(
        'https://api.github.com/graphql',
        {
            query: `query { 
                repository(owner: "${config.owner}", name: "${config.repo}") {
                    id,
                    labels(first: 100) {
                        nodes {
                            id,
                            name,
                            color,
                        } 
                    },
                    milestones(first:100) {
                        nodes {
                            id,
                            number,
                            state,
                            title,
                        }
                    },
                    issues(last:20, states:OPEN) {
                        pageInfo {
                            endCursor,
                            startCursor,
                            hasNextPage,
                            hasPreviousPage
                        },
                        totalCount,
                        nodes {
                            id,
                            title,
                            number,
                            createdAt,
                            milestone {
                                id
                            },
                            labels(first:100) {
                                nodes {
                                    id,
                                }
                            }
                        }
                    }
                }
            }`
        },
        {
            headers: {
                Authorization: `bearer ${getToken()}`
            },
        }
    ).then(response => {
        return normalize(response.data.data.repository, repository);
    });
}

export async function getSingleIssue(number) {
    return axios.post(
        'https://api.github.com/graphql',
        {
            query: `query { 
                repository(owner: "${config.owner}", name: "${config.repo}") {
                    id,
                    issue(number: ${number}) {
                        id,
                        title,
                        number,
                        bodyHTML,
                        createdAt,
                        milestone {
                            id,
                            number,
                            state,
                            title,
                        },
                        labels(first:100) {
                            nodes {
                                id,
                                name,
                                color,
                            }
                        },
                        comments(last: 20) {
                            nodes {
                                id,
                                author {
                                    avatarUrl,
                                    login,
                                    url,
                                },
                                bodyHTML,
                                createdAt,
                            }
                        }
                    }
                }
            }`
        },
        {
            headers: {
                Authorization: `bearer ${getToken()}`
            },
        }
    ).then(response => {
        return normalize(response.data.data.repository, repository);
    })
}

export function getLoginAuthLink() {
    const query = {
        scope: 'public_repo, user',
        redirect_uri: encodeURIComponent(`https://zhirui1994.github.io/#/article/1`),
        client_id: config.client_id,
        // client_secret: config.client_secret,
    }
    const queryString = Object.keys(query).map(key => `${key}=${query[key]}`).join('&');
    return `https://github.com/login/oauth/authorize?${queryString}`
}

export async function userAuth(code) {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token'
    return axios.post(proxyUrl, {
        code,
        client_id: config.client_id,
        client_secret: config.client_secret,
    },
    {
        headers: {
            Accept: 'application/json'
        }
    }).then(response => {
        return response && response.data;
    })
}

export async function getViewer(token) {
    return axios.post('https://api.github.com/graphql', {
        query: `query { 
            viewer {
                email,
                id,
                login,
                name,
                url,
                avatarUrl, 
            }
        }`
        },
        {
            headers: {
                Authorization: token,
            }
        }
    ).then(response => {
        return response && response.data && response.data.data;
    });
}