import { schema } from 'normalizr';

export const milestone = new schema.Entity('milestones');
export const label = new schema.Entity('labels');
export const comment = new schema.Entity('comments');
export const issue = new schema.Entity('issues', {
    milestone: milestone,
    labels: {
        nodes: [label]
    },
    comments: {
        nodes:[comment]
    },
});
export const repository = new schema.Entity('repositories', {
    issue,
    issues: {
        nodes: [issue]
    },
    labels: {
        nodes: [label]
    },
    milestones: {
        nodes: [milestone]
    },
})