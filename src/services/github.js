import axios from 'axios';
import { normalize } from 'normalizr';
import config from '../commons/config';
import { repository } from '../commons/schemas';

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
                            description,
                        } 
                    },
                    milestones(first:100) {
                        nodes {
                            id,
                            number,
                            state,
                            title,
                            description,
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
                Authorization: 'token a068f2626ecd32c5dc40fd871d6e47b34de4eec4'
            },
        }
    ).then(response => {
        return normalize(response.data.data.repository, repository);
    });
}