import React from 'react';
import ArticleItem from '../ArticleItem';

const ArticlesList = (props) => {
    const { data, editable=false } = props;
    return (
        <div>
            {data.map(article => {
                return <ArticleItem editable={editable} key={article.id} article={article} />
            })}
        </div>
    );
}

export default ArticlesList;