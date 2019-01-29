import React, { Component } from 'react';
import marked from 'marked';
import styles from './style.module.scss';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-gist.css';

marked.setOptions({
    breaks: true,
    highlight: (code) => {
        return hljs.highlightAuto(code).value;
    }
})

class MarkdownPreviewer extends Component {
    state = {
        isEdiotr: true,
    };

    componentDidMount() {
        const { defaultValue } = this.props;
        if (defaultValue) {
            this.preview.innerHTML = marked(defaultValue);
        }
    }

    handleInput = (e) => {
        const { onChange } = this.props;
        const value = this.editor.value;
        e.preventDefault();
        typeof onChange === 'function' && onChange(value);
        this.preview.innerHTML = marked(value);
    }

    handleClickPreview = () => {
        this.setState({
            isEdiotr: false,
        });
    }

    handleClickEditor = () => {
        this.setState({
            isEdiotr: true,
        });
    }

    render() {
        const { defaultValue } = this.props;
        const { isEdiotr } = this.state;
        return (
            <div className={styles.markdownPreviewer}>
                <ul className={styles.editController}>
                    <li onClick={this.handleClickEditor} className={!isEdiotr ? styles.active : 'hidden'}>预览</li>
                    <li onClick={this.handleClickPreview} className={isEdiotr ? styles.active : 'hidden'}>编辑</li>
                </ul>
                <textarea
                    id="editor"
                    spellCheck="false"
                    className={isEdiotr ? styles.active : 'hidden'}
                    ref={textarea => this.editor = textarea}
                    onInput={this.handleInput}
                    defaultValue={defaultValue}
                ></textarea>
                <section
                    className={!isEdiotr ? styles.active : 'hidden'}
                    id="preview"
                    ref={section => this.preview = section}
                ></section>
            </div>
        );
    }
}

export default MarkdownPreviewer;
