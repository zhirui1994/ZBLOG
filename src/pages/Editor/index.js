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
        body: '',
        milestone: void(0),
        labels: [],
    }

    get number() {
        return memoize(
            (match) => match.params.number
        )(this.props.match);
    }

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
            const body = currentIssue.body || '';
            const milestone = milestonesMap[currentIssue.milestone].number || '';
            const labels = (currentIssue.labels
                && currentIssue.labels.nodes
                && currentIssue.labels.nodes.map(id => {
                    return labelsMap[id].name;
                })) || [];

            return {
                prevCurrentIssue: currentIssue,
                title,
                body,
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
        if (!labelsList.length || !milestonesList.length || number) {
            dispatch.repository.initEditor(number);
        }
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch.repository.closeCurrentIssue();
    }

    handleChange = (value) => {
        this.setState({
            body: value,
        });
    }

    handleRadioClick = (e) => {
        e.stopPropagation();
        let input;
        if (e.target.tagName === 'LABEL') {
            e.preventDefault();
            input = e.target.querySelector('input');
        } else if (e.target.tagName === 'INPUT') {
            input = e.target;
        }
        if (input) {
            const value = +input.value;
            if (this.state.milestone === value) {
                this.setState({
                    milestone: void(0),
                });
            } else {
                this.setState({
                    milestone: value,
                });
            }
        }
        return false;
    }

    handleCheckboxClick = (e) => {
        e.stopPropagation();
        let input;
        if (e.target.tagName === 'LABEL') {
            e.preventDefault();
            input = e.target.querySelector('input');
        } else if (e.target.tagName === 'INPUT') {
            input = e.target;
        }
        if (input) {
            const labels = this.state.labels;
            const value = input.value;
            const idx = labels.indexOf(value);
            if (idx !== -1) {
                labels.splice(idx, 1);
                this.setState({
                    labels: [...labels],
                });
            } else {
                labels.push(value);
                this.setState({
                    labels: [...labels],
                });
            }
        }
        return false;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { dispatch } = this.props;
        const { title, body, milestone, labels } = this.state; 
        if (title && body && milestone && labels) {
            const params = {
                title,
                body,
                labels,
                milestone,
                callback: (url) => {
                    this.props.history.push(url)
                }
            };
            const number = this.number;
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
                        <input className={styles.titleInput} defaultValue={this.state.title} ref={input => this.title = input} type="text" id="title" />
                    </label>
                    <label className={classNames(styles.fileds, styles.editorContent)} htmlFor="editor">内容：
                        <MarkdownPreviewer
                            defaultValue={this.state.body}
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
                                        readOnly
                                        type="radio"
                                        name="categories"
                                        value={milestone.number}
                                        checked={this.state.milestone === milestone.number}
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
                                        readOnly
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
