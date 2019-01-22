import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { createSelector } from 'reselect';
import Loading from '../../components/Loading'
import ArticlesList from '../../components/ArticlesList';
import styles from './style.module.scss'

const DEFAULT_MILESTONE = {
    title: '最新',
    id: 'default_milestone'
}
const DEFAULT_ISSUES_OBJ = {
    nodes: [],
    pageInfo: {

    },
    totalCount: 0,
}

class IndexPage extends Component {
    state = {
        activeMilestone: DEFAULT_MILESTONE,
    };

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch.repository.initIndex();
    }

    handleCategoryClick = (category) => {
        const { dispatch } = this.props;
        this.setState({
            activeMilestone: category,
        });
        const title = category.id === DEFAULT_MILESTONE.id ? '*' : category.title;
        dispatch.repository.searchIssues({
            milestone: title,
        });
    }

    render() {
        const { activeMilestone } = this.state;
        const {
            loading,
            issuesList,
            milestonesList,
        } = this.props;
        return (
            <Loading loading={loading}>
                <div className={styles.container}>
                    <header className={styles.header}>
                    <nav>
                        {milestonesList.map(milestone => {
                            return (
                                <span
                                    onClick={() => this.handleCategoryClick(milestone)}
                                    key={milestone.id}
                                    className={classNames(
                                        styles.navItem,
                                        {
                                            [styles.active]:
                                                milestone.title === activeMilestone.title,
                                        },
                                    )}
                                >
                                    {milestone.title}
                                </span>
                            )
                        })}
                    </nav>
                    </header>
                    <main className={styles.articlesContainer}>
                        <ArticlesList data={issuesList} />
                    </main>
                </div>
            </Loading>
        );
    }
}

const mapState = createSelector(
    [
        store => store.repository.result,
        store => store.repository.loading,
        store => store.entities.repositories,
        store => store.entities.issues,
        store => store.entities.milestones,
        store => store.entities.labels,
    ],
    (
        result,
        loading,
        repositoriesMap,
        issuesMap,
        milestonesMap,
        labelsMap,
    ) => {
        const repository = repositoriesMap[result];
        const milestonesList = Object.keys(milestonesMap).map(id => milestonesMap[id]);
        if (milestonesList.length) {
            milestonesList.unshift(DEFAULT_MILESTONE);
        }
        let issuesList = [];
        let issuesObj = DEFAULT_ISSUES_OBJ;
        if (repository && repository.issues && repository.issues.nodes) {
            issuesObj = repository.issues;
            issuesList = issuesObj.nodes.map((id) => {
                const issue = issuesMap[id];
                issue.milestone = milestonesMap[issue.milestone];
                if (issue.labels && issue.labels.nodes) {
                    issue.labels.nodes = issue.labels.nodes.map(id => labelsMap[id]);
                }
                return issue;
            })
        }
        return {
            loading,
            issuesList,
            milestonesList,
            pageInfo: issuesObj.pageInfo,
            totalCount: issuesObj.totalCount,
        }
    }
)

export default connect(mapState)(IndexPage);
