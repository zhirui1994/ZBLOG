import React from 'react';
import ReactDOM from 'react-dom';
import styles from './style.module.scss';

const Dialog = (props) => {
    const {
        title,
        children,
        footer,
        visible,
        onOk,
        onCancel
    } = props;
    if (visible) {
        return ReactDOM.createPortal(
            (<div className={styles.dialogMask}>
                <div className={styles.dialogContent}>
                    <header className="dialog-header">
                        <h3>{title}</h3>
                    </header>
                    <div className="dialog-body">
                        {children}
                    </div>
                    <footer className="dialog-footer">
                        {footer ? footer :
                         ([
                            <button key="dialog-ok" onClick={onOk} >确定</button>,
                            <button key="dialog-cancel" onClick={onCancel}>取消</button>
                         ])
                        }
                    </footer>
                </div>
            </div>),
            document.body
        )
    } else {
        return null;
    }
}

export default Dialog;