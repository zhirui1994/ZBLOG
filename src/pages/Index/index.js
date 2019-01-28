import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Loading from '../../components/Loading'
import ArticlesList from '../../components/ArticlesList';
import CategoriesNavigator from '../../components/CategoriesNavigator';
import { getLoginAuthLink } from '../../services/github';
import config from '../../commons/config';
import Dialog from '../../components/Dialog';
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
    state = {
        currentCategory: null,
        loginVisible: false,
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch.user.getAuthToken();
        dispatch.repository.initIndex();
    }

    handleCategoryClick = (category) => {
        const { dispatch } = this.props;
        this.setState({
            currentCategory: category,
        });
        const title = category.id === DEFAULT_MILESTONE.id ? '*' : category.title;
        dispatch.repository.searchIssues({
            milestone: title,
        });
    }

    handleSearch = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            const query = this.search.value;
            const { dispatch } = this.props;
            const { currentCategory } = this.state;
            const title = (!currentCategory || currentCategory.id === DEFAULT_MILESTONE.id) ? '*' : currentCategory.title;
            dispatch.repository.searchIssues({
                query,
                milestone: title,
            });
        }
    }

    handleLogin = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            loginVisible: true,
        });
    }

    handleLoginOk = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const username = this.username.value;
        const password = this.password.value;
        if (username && password) {
            const { dispatch } = this.props;
            const params = {
                username,
                password,
            }
            dispatch.user.getAuthUser(params);
            this.handleLoginCancel(e);
        }
    }

    handleLoginCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            loginVisible: false,
        });
    }

    render() {
        const {
            viewer,
            loading,
            issuesList,
            isUserLoading,
            milestonesList,
        } = this.props;
        const { loginVisible } = this.state;
        const isPwa = window.location.href.indexOf('from=pwa') !== -1;
        return (
            <Loading loading={loading}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <div className={styles.top}>
                            <img alt="网站Logo" src={logoUrl} />
                            <h1>Roy Zhi's Blog</h1>
                            <div className={styles.right}>
                                <input
                                    type="search"
                                    ref={search => this.search = search}
                                    placeholder="请输入关键字搜索"
                                    onKeyDown={this.handleSearch}
                                />
                                {(viewer.id || isUserLoading)?
                                    (<div className={styles.createCommentAvatar}>
                                        {isUserLoading ? 
                                            <i className="fa fa-refresh fa-spin fa-3x fa-fw"></i>
                                            :
                                            <img src={viewer.avatarUrl} alt="This is commentor's avatar" />
                                        }
                                    </div>)
                                    : isPwa ? <span onClick={this.handleLogin}>登陆</span>
                                    : <a href={getLoginAuthLink()}>登陆</a>
                                }
                            </div>
                        </div>
                        <CategoriesNavigator
                            data={milestonesList}
                            defaultCategory={DEFAULT_MILESTONE}
                            onCategoryClick={this.handleCategoryClick}
                        />
                    </header>
                    <main className={styles.articlesContainer}>
                        <ArticlesList editable={viewer.login === config.owner} data={issuesList} />
                    </main>
                </div>
                <Dialog
                    title="通过GitHub登陆"
                    visible={loginVisible}
                    onOk={this.handleLoginOk}
                    onCancel={this.handleLoginCancel}
                >
                    <form className={styles.loginForm}>
                        <input
                            type="text"
                            className={styles.loginField} 
                            placeholder="请输入GitHub用户名"
                            ref={username => this.username = username}
                        />
                        <input
                            type="password"
                            className={styles.loginField}
                            placeholder="请输入密码"
                            ref={password => this.password = password}
                        />
                    </form>
                </Dialog>
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
        store => store.user.viewer,
        store => store.user.loading,
    ],
    (
        result,
        loading,
        repositoriesMap,
        issuesMap,
        milestonesMap,
        labelsMap,
        viewer,
        isUserLoading,
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
                // 引用类型，会直接修改store中的数，千万要避免
                const issue = Object.create(issuesMap[id]);
                issue.milestone = milestonesMap[issue.milestone];
                if (issue.labels && issue.labels.nodes) {
                    issue.labels = {
                        ...issue.labels,
                        nodes: issue.labels.nodes.map(id => labelsMap[id]),
                    }
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
            viewer,
            isUserLoading,
        }
    }
)

export default connect(mapState)(IndexPage);
