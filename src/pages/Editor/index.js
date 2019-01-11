import React, { Component } from 'react';
import { connect } from 'react-redux';

class EditorPage extends Component {
    constructor(...args){
        super(...args);
        this.handleSubmit = this.handleSubmit.bind(this);
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
            <form>
                <label htmlFor="title">标题：<input ref={input => this.title = input} type="text" id="title" /></label>
                <label htmlFor="body">内容：<textarea ref={textarea => this.body = textarea} cols="60" rows="5" id="body" /></label>
                <input onClick={this.handleSubmit} type="submit" value="创建" />
            </form>
        </div>
        );
    }
}

export default connect()(EditorPage);
