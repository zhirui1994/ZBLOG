import config from '../commons/config';

export default function getToken() {
    const secret = atob(config.token);
    const regexp = new RegExp(`(\\+${config.owner}\\+|\\+${config.repo}\\+)`,'g');
    const token = secret.replace(regexp,'');
    return token;
}