import React from 'react';
import ArticleItem from '../ArticleItem';

const ArticlesList = (props) => {
    const { data } = props;
    return (
        <div>
            {data.map(article => {
                return <ArticleItem key={article.id} article={article} />
            })}
        </div>
    );
}

export default ArticlesList;