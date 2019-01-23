import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import MarkdownPreviewer from '../../components/MarkdownPreviewer';
import styles from './style.module.scss';

class EditorPage extends Component {
    content = '';
    title = '';
    milestone = '';
    labels = [];

    componentDidMount() {
        const { labelsList, milestonesList, dispatch } = this.props;
        if (!labelsList.length || !milestonesList.length) {
            dispatch.repository.initEditor();
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
        const { dispatch, currentRepositoryId } = this.props;
        if (this.title && this.content) {
            dispatch.repository.createIssue({
                title: this.title.value,
                body: this.content,
                labels: this.labels,
                milestone: this.milestone,
                repositoryId: currentRepositoryId,
            })
        }
    }

    render() {
        const { labelsList, milestonesList } = this.props;
        return (
        <div className={styles.editorContainer}>
            <header className={styles.header}>
                <h2>文章编辑页</h2>
            </header>
            <main>
                <form>
                    <label className={styles.fileds} htmlFor="title">标题：<input ref={input => this.title = input} type="text" id="title" /></label>
                    <label className={classNames(styles.fileds, styles.editorContent)} htmlFor="editor">内容：
                        <MarkdownPreviewer onChange={this.handleChange} />
                    </label>
                    <label className={styles.fileds} htmlFor="milestone">
                        分类：
                        {milestonesList.map(milestone => {
                            return (
                                <label key={milestone.id} className={styles.checkLabel}>
                                    <input onChange={this.handleRadioChange} type="radio" name="categories" value={milestone.id} />
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
                                    <input onChange={this.handleCheckboxChange} type="checkbox" name={`label-${label.name}`} value={label.id}/>
                                    {label.name}
                                </label>
                            );
                        })}
                    </label>
                    <input className={styles.submitButton} onClick={this.handleSubmit} type="submit" value="创建" />
                </form>
            </main>
            <footer>
                <p>Copyright ©{new Date().getFullYear()} Roy Zhi</p>
            </footer>
        </div>
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
    ],
    (
        result,
        loading,
        repositoriesMap,
        labelsMap,
        milestonesMap
    ) => {
        let labelsList = [], milestonesList = [];
        const currentRepositoryId = result;
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
        }
        return {
            loading,
            labelsList,
            milestonesList,
            currentRepositoryId,
        }
    }
)

export default connect(mapState)(EditorPage);
