import React, { Component } from 'react';
import { connect } from 'react-redux';

class EditorPage extends Component {
    constructor(...args){
        super(...args);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleEditorInput(e) {
        
    }

    handleSubmit(e) {
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
        <div className="Editor">
            <header className="App-header">
                文章编辑页！
            </header>
            <main>
                <form>
                    <label htmlFor="title">标题：<input ref={input => this.title = input} type="text" id="title" /></label>
                    <label htmlFor="milestone">分类：</label>
                    <label htmlFor="labels">标签：</label>
                    <label htmlFor="body">内容：</label>
                    <div>
                        <textarea spellCheck="false" ref={textarea => this.editor = textarea} onInput={this.handleEditorInput} id="editor"></textarea>
                        <section ref={section => this.preview = section} id="preview"></section>
                    </div>
                    <input onClick={this.handleSubmit} type="submit" value="创建" />
                </form>
            </main>
            <footer>
                页脚
            </footer>
        </div>
        );
    }
}

export default connect()(EditorPage);
