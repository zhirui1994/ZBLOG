import React, { PureComponent } from 'react';
import classNames from 'classnames';
import styles from './style.module.scss';

class CategoriesNavgator extends PureComponent {
    state = {
        activeCategory: this.props.defaultCategory,
    };

    handleClick = (category) => {
        const { onCategoryClick } = this.props;
        this.setState({
            activeCategory: category,
        });
        onCategoryClick(category);
    }

    render() {
        const { data } = this.props;
        const { activeCategory } = this.state;
        return (
            <nav>
                {data.map(category => {
                    return (
                        <span
                            onClick={() => this.handleClick(category)}
                            key={category.id}
                            className={classNames(
                                styles.navItem,
                                {
                                    [styles.active]:
                                        category.title === activeCategory.title,
                                },
                            )}
                        >
                            {category.title}
                        </span>
                    )
                })}
            </nav>
        );
    }
}

export default CategoriesNavgator;