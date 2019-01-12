import React, { Fragment } from 'react';
import styles from './style.module.scss';

const Loading = ({ children, loading=true }) => {
    if (loading) {
        return (
            <div className={styles.loadingContainer} >
                <i className="fa fa-spinner fa-pulse"></i>
            </div>
        );
    } else {
        return (
            <Fragment>
                {children}
            </Fragment>
        );
    }
}

export default Loading;
