import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import MarkdownPreviewer from '../../components/MarkdownPreviewer';
import styles from './style.module.scss';

class EditorPage extends Component {
    content = undefined;

    componentDidMount() {
        const { labelsList, milestonesList, dispatch } = this.props;
        if (!labelsList.length || !milestonesList.length) {
            dispatch.repository.initEditor();
        }
    }

    handleChange = (value) => {
        this.content = value;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { dispatch } = this.props;
        if (this.title && this.content) {
            dispatch.issues.create({
                title: this.title.value,
                body: this.content,
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
                                <label className={styles.checkLabel}>
                                    <input type="radio" name="categories" value={milestone.id} />
                                    {milestone.title}
                                </label>
                            );
                        })}
                    </label>
                    <label className={styles.fileds} htmlFor="labels">
                        标签：
                        {labelsList.map(label => {
                            return (
                                <label className={styles.checkLabel}>
                                    <input type="checkbox" name={`label-${label.name}`} value={label.id}/>
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
        }
    }
)

export default connect(mapState)(EditorPage);
