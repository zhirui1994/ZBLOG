import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Loading from '../../components/Loading'
import ArticlesList from '../../components/ArticlesList';
import CategoriesNavigator from '../../components/CategoriesNavigator';
import styles from './style.module.scss';
import logoUrl from './Blog_48px.png';

const DEFAULT_MILESTONE = {
    title: '最新',
    id: 'default_milestone'
}

const DEFAULT_ISSUES_OBJ = {
    nodes: [],
    pageInfo: {},
    totalCount: 0,
}

class IndexPage extends Component {
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch.repository.initIndex();
    }

    handleCategoryClick = (category) => {
        const { dispatch } = this.props;
        const title = category.id === DEFAULT_MILESTONE.id ? '*' : category.title;
        dispatch.repository.searchIssues({
            milestone: title,
        });
    }

    render() {
        const {
            loading,
            issuesList,
            milestonesList,
        } = this.props;
        return (
            <Loading loading={loading}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <div className={styles.top}>
                            <img alt="网站Logo" src={logoUrl} />
                            <h1>Roy Zhi's Blog</h1>
                        </div>
                        <CategoriesNavigator
                            data={milestonesList}
                            defaultCategory={DEFAULT_MILESTONE}
                            onCategoryClick={this.handleCategoryClick}
                        />
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
