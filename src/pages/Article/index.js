import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import { createSelector } from 'reselect';
import classNames from 'classnames';
import moment from 'moment';
import Loading from '../../components/Loading';
import styles from './style.module.scss';

class ArticlePage extends Component {
    componentDidMount() {
        const { dispatch, match } = this.props;
        const number = match.params.number;
        dispatch.repository.getSingleIssue(number);
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch.repository.closeCurrentIssue();
    }

    render() {
        const {
            loading,
            labelsMap,
            commentsMap,
            currentIssue,
            milestonesMap,
        } = this.props;

        return (
            <Loading loading={loading}>
                <div className={styles.container}>
                    <header>
                        <h1>{currentIssue.title}</h1>
                        <p className={styles.articleInfo}>
                            <span>
                                <i className="fa fa-calendar" aria-hidden="true"></i>
                                {moment(currentIssue.createdAt).format('YYYY-MM-DD')}
                            </span>
                            <span>
                                <i className="fa fa-th-list" aria-hidden="true"></i>
                                <span className={styles.articleCategory}>
                                    {currentIssue.milestone && milestonesMap[currentIssue.milestone].title}
                                </span>
                            </span>
                            <span>
                                <i className="fa fa-tags" aria-hidden="true"></i>
                                {currentIssue.labels && currentIssue.labels.nodes.map(id => {
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
                    </header>
                    <main>
                        <article
                            className={classNames(styles.articleBody, 'markdown-body')}
                            dangerouslySetInnerHTML={{ __html: currentIssue.bodyHTML }}
                        ></article>
                        <div className={styles.issueCommentsContainer}>
                            {currentIssue.comments && currentIssue.comments.nodes.map(id => {
                                const comment = commentsMap[id];

                                if (comment) {
                                    const { author } = comment;
                                    return (
                                        <section key={comment.id} className={styles.issueComment}>
                                            <a className={styles.commentorAvatar} href={author.url}>
                                                <img src={author.avatarUrl} alt="This is commentor's avatar" />
                                            </a>
                                            <p className={styles.issueCommentHeader}>
                                                <a href={author.url}><em>{author.login}</em></a>
                                                <span>{moment(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                                            </p>
                                            <article
                                                className={classNames(styles.issueCommentContent, 'markdown-body')}
                                                dangerouslySetInnerHTML={{ __html: comment.bodyHTML}}
                                            ></article>
                                        </section>
                                    );
                                } else {
                                    return null;
                                }
                            })}
                        </div>
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
        store => store.entities.comments,
    ],
    (
        result,
        loading,
        repositoriesMap,
        issuesMap,
        milestonesMap,
        labelsMap,
        commentsMap,
    ) => {
        let issueID, currentIssue = {};
        const repository = repositoriesMap[result];
        if (repository) {
            issueID = repository.issue;
        }
        if (issueID) {
            currentIssue = issuesMap[issueID];
        }
        return {
            loading,
            currentIssue,
            milestonesMap,
            labelsMap,
            commentsMap,
        };
    }
)


export default  connect(mapState)(withRouter(ArticlePage));