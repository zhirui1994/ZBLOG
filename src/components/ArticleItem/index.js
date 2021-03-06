import React from 'react';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { isLight } from '../../utils/color';
import styles from './style.module.scss';

const ArticleItem = (props) => {
    const { article, editable=false } = props;
    return (
        <article className={styles.article} key={article.id}>
            <NavLink to={`/article/${article.number}`}>
                <h3 title={article.title} className={styles.articleTitle}>{article.title}</h3>
            </NavLink>
            <p className={styles.articleInfo}>
                <span>
                    <i className="fa fa-calendar" aria-hidden="true"></i>
                    {moment(article.createdAt).format('YYYY-MM-DD')}
                </span>
                <span>
                    <i className="fa fa-th-list" aria-hidden="true"></i>
                    {article.milestone && article.milestone.title && (
                        <span className={styles.articleCategory}>{article.milestone.title}</span>
                    )}
                </span>
                <span>
                    <i className="fa fa-tags" aria-hidden="true"></i>
                    {article.labels.nodes.map(label => {
                        if (label) {
                            return (
                                <span
                                    key={label.id}
                                    className={styles.articleLabel}
                                    style={{
                                        background: `#${label.color}`,
                                        color: isLight(label.color) ? '#000' : '#fff',
                                    }}
                                >
                                    {label.name}
                                </span>
                            )
                        } else {
                            return null;
                        }
                    })}
                </span>
            </p>
            {editable ?
                (<NavLink to={`/editor/${article.number}`} className={styles.editIcon}>
                    <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                </NavLink>)
                :
                null
            }
        </article>
    );
}

export default ArticleItem;