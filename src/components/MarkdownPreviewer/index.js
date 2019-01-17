import React, { Component } from 'react';
import marked from 'marked';
import styles from './style.module.scss';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-gist.css';

marked.setOptions({
    highlight: (code) => {
        return hljs.highlightAuto(code).value;
    }
})

class MarkdownPreviewer extends Component {
    handleInput = (e) => {
        const { onChange } = this.props;
        const value = this.editor.value;
        e.preventDefault();
        typeof onChange === 'function' && onChange(value);
        this.preview.innerHTML = marked(value);
    }

    componentDidMount() {
        const { defaultValue } = this.props;
        if (defaultValue) {
            this.preview.innerHTML = marked(defaultValue);
        }
    }

    render() {
        const { defaultValue } = this.props;
        return (
            <div className={styles.markdownPreviewer}>
                <textarea
                    id="editor"
                    spellCheck="false"
                    ref={textarea => this.editor = textarea}
                    onInput={this.handleInput}
                    defaultValue={defaultValue}
                ></textarea>
                <section
                    id="preview"
                    ref={section => this.preview = section}
                ></section>
            </div>
        );
    }
}

export default MarkdownPreviewer;
