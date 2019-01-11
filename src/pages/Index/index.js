import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import moment from 'moment';
import { createSelector } from 'reselect';
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

class App extends Component {
    constructor(...args) {
        super(args);
        this.state = {
            activeMilestone: DEFAULT_MILESTONE
        }
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch.repository.initIndex();
    }

    render() {
        const { activeMilestone } = this.state;
        const {
            issuesList,
            milestonesList,
            milestonesMap,
            labelsMap,
        } = this.props;
        return (
        <div className={styles.container}>
            <header className={styles.header}>
            <nav>
                {milestonesList.map(milestone => {
                    return (
                        <a
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
                        </a>
                    )
                })}
            </nav>
            </header>
            <main className={styles.articlesContainer}>
                {issuesList.map(issue => {
                    return (
                        <article className={styles.article} key={issue.id}>
                            <h3 className={styles.articleTitle}>{issue.title}</h3>
                            <p className={styles.articleInfo}>
                                <span>
                                    <i className="fa fa-calendar" aria-hidden="true"></i>
                                    {moment(issue.createdAt).format('YYYY-MM-DD')}
                                </span>
                                <span>
                                    <i className="fa fa-th-list" aria-hidden="true"></i>
                                    <span className={styles.articleCategory}>{milestonesMap[issue.milestone].title}</span>
                                </span>
                                <span>
                                    <i className="fa fa-tags" aria-hidden="true"></i>
                                    {issue.labels.nodes.map(id => {
                                        const label = labelsMap[id]
                                        return (
                                            <span
                                                key={label.id}
                                                className={styles.articleLabel}
                                                style={{
                                                    background: `#${label.color}`,
                                                }}
                                            >
                                                {label.name}
                                            </span>
                                        )
                                    })}
                                </span>
                            </p>
                        </article>
                    )
                })}
            </main>
        </div>
        );
    }
}

const mapState = createSelector(
    [
        store => store.repository.result,
        store => store.entities.repositories,
        store => store.entities.issues,
        store => store.entities.milestones,
        store => store.entities.labels,
    ],
    (
        result,
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
        let issuesObj = DEFAULT_ISSUES_OBJ;
        if (repository) {
            issuesObj = repository.issues;
        }
        return {
            labelsMap,
            milestonesMap,
            milestonesList,
            issuesList: issuesObj.nodes.map(id => issuesMap[id]),
            pageInfo: issuesObj.pageInfo,
            totalCount: issuesObj.totalCount,
        }
    }
)

export default connect(mapState)(App);
