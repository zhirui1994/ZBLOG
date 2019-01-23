import axios from 'axios';
import { normalize } from 'normalizr';
import config from '../commons/config';
import { repository, comment as commentSchema, issue as issueSchema } from '../commons/schemas';
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
                    issues(last:20, states:OPEN, orderBy: {direction: DESC, field: UPDATED_AT}) {
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
        return response && response.data && response.data.data && response.data.data.viewer;
    });
}

export async function addComment({id, content, token}) {
    return axios.post(
        'https://api.github.com/graphql',
        {
            query: `mutation {
                addComment(input:{subjectId: "${id}", body: "${content}"}) {
                    commentEdge {
                        node {
                            id,
                            bodyHTML,
                            createdAt,
                            author {
                                avatarUrl,
                                login,
                                url,
                            },
                        }
                    }
                }
            }`
        },
        {
            headers: {
                Authorization: token,
            }
        }
    ).then(response => {
        const comment = response && response.data && response.data.data
            && response.data.data.addComment.commentEdge.node;
        if (comment) {
            return normalize(comment, commentSchema)
        }
    });
}

export async function initEditor() {
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
                }
            }`
        },
        {
            headers: {
                Authorization: `bearer ${getToken()}`
            },
        }
    ).then(response => {
        const repositoryObj = response && response.data
            && response.data.data && response.data.data.repository;
        if (repositoryObj) {
            return normalize(repositoryObj, repository);
        } else {
            return false;
        }
    })
}

export async function searchIssues(params) {
    let queryString = `repo:${config.owner}/${config.repo} `;
    if (params && params.milestone) {
        queryString += `milestone:${params.milestone} `;
    }
    if (params && params.labels && params.labels.length) {
        queryString += params.labels.map(label => `label:${label} `).join('');
    }
    if (params && params.query) {
        queryString += `${params.query} `
    }
    return axios.post(
        'https://api.github.com/graphql',
        {
            query: `query {
                search(type: ISSUE, last: 20, query: "${queryString.trim()}") {
                    issueCount
                    pageInfo {
                        endCursor
                        startCursor
                        hasNextPage
                        hasPreviousPage
                    }
                    nodes {
                        ... on Issue {
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
            }`,
        },
        {
            headers: {
                Authorization: `bearer ${getToken()}`
            },
        }
    ).then(response => {
        const search = response && response.data && response.data.data && response.data.data.search;
        if (search) {
            const norNodes = normalize(search.nodes, [issueSchema]);
            return {
                ...search,
                nodes: norNodes.result,
                entities: norNodes.entities,
            }
        } else {
            return false;
        }
    });
}


export async function createIssue(params) {
    return axios.post(`https://api.github.com/repos/${config.owner}/${config.repo}/issues`,
    {
        title: params.title,
        body: params.body,
        milestone: params.milestone,
        labels: params.labels,
    },
    {
        headers: {
            Authorization: `token ${getToken()}`
        },
    }).then(response => {
        const issue = response && response.data
        if (issue) {
            issue.id = issue.node_id;
            issue.labels = {
                nodes: issue.labels.map(label => {
                    label.id = label.node_id;
                    return label;
                })
            };
            issue.milestone.id = issue.milestone.node_id;
            issue.comments = {
                nodes: []
            };
            return normalize(issue, issueSchema);
        }
    })
}

export async function editIssue(params) {
    return axios.patch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/issues/${params.number}`,
        {
            title: params.title,
            body: params.body,
            milestone: params.milestone,
            labels: params.labels
        },
        {
            headers: {
                Authorization: `token ${getToken()}`
            },
        }
    ).then(response => {
        const issue = response && response.data
        if (issue) {
            issue.id = issue.node_id;
            issue.labels = {
                nodes: issue.labels.map(label => {
                    label.id = label.node_id;
                    return label;
                })
            };
            issue.milestone.id = issue.milestone.node_id;
            issue.comments = {
                nodes: []
            };
            return normalize(issue, issueSchema);
        }
    })
}