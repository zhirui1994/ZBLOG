import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import MarkdownPreviewer from '../../components/MarkdownPreviewer';
import styles from './style.module.scss';

class EditorPage extends Component {
    handleChange = (value) => {
        
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { dispatch } = this.props;
        if (this.title && this.body) {
            dispatch.issues.create({
                title: this.title.value,
                body: this.body.value,
            })
        }
    }

    render() {
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
                        <label className={styles.checkLabel}><input type="radio" name="分类" value="a"/>分类1</label>
                        <label className={styles.checkLabel}><input type="radio" name="分类" value="b"/>分类2</label>
                        <label className={styles.checkLabel}><input type="radio" name="分类" value="c"/>分类3</label>
                    </label>
                    <label className={styles.fileds} htmlFor="labels">
                        标签：
                        <label className={styles.checkLabel}><input type="checkbox" name="标签1" value="a"/>标签1</label>
                        <label className={styles.checkLabel}><input type="checkbox" name="标签2" value="b"/>标签2</label>
                        <label className={styles.checkLabel}><input type="checkbox" name="标签3" value="c"/>标签3</label>
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

export default connect()(EditorPage);
