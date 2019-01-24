import React, { Component } from 'react';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import MarkdownPreviewer from '../../components/MarkdownPreviewer';
import Loading from '../../components/Loading';
import styles from './style.module.scss';

class EditorPage extends Component {
    content = '';
    title = '';
    milestone = '';
    labels = [];

    get number() {
        const { match } = this.props;
        return match.params.number;
    }

    get currentIssue() {
        const { currentIssue } = this.props;
        const number = this.number;
        if (number && currentIssue && currentIssue.number === +number) {
            return currentIssue
        } else {
            return {};
        }
    }

    componentDidMount() {
        const { labelsList, milestonesList, dispatch } = this.props;
        const number = this.number;
        if (!labelsList.length || !milestonesList.length) {
            dispatch.repository.initEditor(number);
        }
    }

    handleChange = (value) => {
        this.content = value;
    }

    handleRadioChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const input = e.target;
        if (input.checked) {
            this.milestone = input.value;
        } else {
            this.milestone = '';
        }
    }

    handleCheckboxChange = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const input = e.target;
        const idx = this.labels.indexOf(input.value);
        if (input.checked) {
            if (idx === -1) {
                this.labels.push(input.value);
            }
        } else {
            if (idx !== -1) {
                this.labels.splice(idx, 1);
            }
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { dispatch } = this.props;
        const number = this.number;
        if (this.title && this.content) {
            const params = {
                title: this.title.value,
                body: this.content,
                labels: this.labels,
                milestone: this.milestone,
                callback: (url) => {
                    this.props.history.push(url)
                }
            };
            if (number) {
                dispatch.repository.editIssue({
                    ...params,
                    number,
                })
            } else {
                dispatch.repository.createIssue(params)
            }
        }
    }

    render() {
        const { labelsList, milestonesList, loading } = this.props;
        const defaultValue = this.currentIssue.body;
        const number = this.number;
        return (
            <Loading loading={loading}>
        <div className={styles.editorContainer}>
            <header className={styles.header}>
                <h2>文章编辑页</h2>
            </header>
            <main>
                <form>
                    <label className={styles.fileds} htmlFor="title">标题：
                        <input defaultValue={this.currentIssue.title} ref={input => this.title = input} type="text" id="title" />
                    </label>
                    <label className={classNames(styles.fileds, styles.editorContent)} htmlFor="editor">内容：
                        <MarkdownPreviewer
                            defaultValue={defaultValue}
                            onChange={this.handleChange}
                        />
                    </label>
                    <label className={styles.fileds} htmlFor="milestone">
                        分类：
                        {milestonesList.map(milestone => {
                            return (
                                <label key={milestone.id} className={styles.checkLabel}>
                                    <input
                                        type="radio"
                                        name="categories"
                                        value={milestone.number}
                                        onChange={this.handleRadioChange}
                                        defaultChecked={this.currentIssue.milestone && this.currentIssue.milestone === milestone.id}
                                    />
                                    {milestone.title}
                                </label>
                            );
                        })}
                    </label>
                    <label className={styles.fileds} htmlFor="labels">
                        标签：
                        {labelsList.map(label => {
                            return (
                                <label key={label.id} className={styles.checkLabel}>
                                    <input
                                        type="checkbox"
                                        value={label.name}
                                        name={`label-${label.name}`}
                                        onChange={this.handleCheckboxChange}
                                        defaultChecked={this.currentIssue.labels && this.currentIssue.labels.nodes.indexOf(label.id) !== -1}
                                    />
                                    {label.name}
                                </label>
                            );
                        })}
                    </label>
                    <input className={styles.submitButton} onClick={this.handleSubmit} type="submit" value={number ? "修改" : "创建"} />
                </form>
            </main>
            <footer>
                <p>Copyright ©{new Date().getFullYear()} Roy Zhi</p>
            </footer>
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
        store => store.entities.labels,
        store => store.entities.milestones,
        store => store.entities.issues,
    ],
    (
        result,
        loading,
        repositoriesMap,
        labelsMap,
        milestonesMap,
        issuesMap
    ) => {
        let labelsList = [], milestonesList = [], currentIssue;
        const currentRepository = repositoriesMap[result];
        if (
            currentRepository &&
            currentRepository.labels &&
            currentRepository.labels.nodes &&
            currentRepository.milestones &&
            currentRepository.milestones.nodes
        ) {
            labelsList = currentRepository.labels.nodes.map(id => labelsMap[id]);
            milestonesList = currentRepository.milestones.nodes.map(id => milestonesMap[id]);
            const currentIssueId = currentRepository.issue;
            if (currentIssueId) {
                currentIssue = issuesMap[currentIssueId]
            }
        }
        return {
            loading,
            labelsList,
            milestonesList,
            currentIssue,
        }
    }
)

export default connect(mapState)(withRouter(EditorPage));
