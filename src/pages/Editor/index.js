import React, { PureComponent } from 'react';
import classNames from 'classnames';
import memoize from 'memoize-one';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import MarkdownPreviewer from '../../components/MarkdownPreviewer';
import Loading from '../../components/Loading';
import styles from './style.module.scss';

class EditorPage extends PureComponent {
    state = {
        title: '',
        content: '',
        milestone: '',
        labels: [],
    }

    number = memoize((match) => {
        return match.params.number;
    });

    static getDerivedStateFromProps(props, state) {
        const { match, currentIssue, milestonesMap, labelsMap } = props;
        const { prevCurrentIssue } = state;
        const number = match.params.number;
        if (
            number &&
            currentIssue &&
            currentIssue.number === +number &&
            currentIssue !== prevCurrentIssue
        ) {
            const title = currentIssue.title || '';
            const content = currentIssue.body || '';
            const milestone = milestonesMap[currentIssue.milestone].number || '';
            const labels = (currentIssue.labels
                && currentIssue.labels.nodes
                && currentIssue.labels.nodes.map(id => {
                    return labelsMap[id].name;
                })) || [];

            return {
                prevCurrentIssue: currentIssue,
                title,
                content,
                milestone,
                labels,
            }
        } else {
            return null;
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
        this.setState({
            content: value,
        });
    }

    handleRadioClick = (e) => {
        const label = e.currentTarget;
        let input;
        if (label && (input = label.querySelector('input')) && input) {
            if (input.checked) {
                this.setState({
                    milestone: input.value,
                });
            } else {
                this.setState({
                    milestone: '',
                });
            }
        }
    }

    handleCheckboxClick = (e) => {
        const label = e.currentTarget;
        let input;
        if (label && (input = label.querySelector('input')) && input) {
            const labels = this.state.labels;
            const idx = labels.indexOf(input.value);
            if (input.checked) {
                if (idx === -1) {
                    labels.push(input.value);
                    this.setState({
                        labels: [...labels],
                    });
                }
            } else {
                if (idx !== -1) {
                    labels.splice(idx, 1);
                    this.setState({
                        labels: [...labels],
                    });
                }
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
                        <input defaultValue={this.state.title} ref={input => this.title = input} type="text" id="title" />
                    </label>
                    <label className={classNames(styles.fileds, styles.editorContent)} htmlFor="editor">内容：
                        <MarkdownPreviewer
                            defaultValue={this.state.content}
                            onChange={this.handleChange}
                        />
                    </label>
                    <label className={styles.fileds} htmlFor="milestone">
                        分类：
                        {milestonesList.map(milestone => {
                            return (
                                <label
                                    key={milestone.id}
                                    className={styles.checkLabel}
                                    onClick={this.handleRadioClick}
                                >
                                    <input
                                        type="radio"
                                        name="categories"
                                        value={milestone.number}
                                        checked={this.state.milestone === milestone.id}
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
                                <label
                                    key={label.id}
                                    className={styles.checkLabel}
                                    onClick={this.handleCheckboxClick}
                                >
                                    <input
                                        type="checkbox"
                                        value={label.name}
                                        name={`label-${label.name}`}
                                        checked={this.state.labels.indexOf(label.name) !== -1}
                                    />
                                    {label.name}
                                </label>
                            );
                        })}
                    </label>
                    <input
                        type="submit"
                        value={number ? "修改" : "创建"}
                        className={styles.submitButton}
                        onClick={this.handleSubmit}
                    />
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
            labelsMap,
            labelsList,
            milestonesMap,
            milestonesList,
            currentIssue,
        }
    }
)

export default connect(mapState)(withRouter(EditorPage));
