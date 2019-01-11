import { shcema, schema } from 'normalizr';

export const milestone = new schema.Entity('milestones');
export const label = new schema.Entity('labels');
export const issue = new schema.Entity('issues', {
    milestone: milestone,
    labels: {
        nodes: [label]
    }
});
export const repository = new schema.Entity('repositories', {
    issues: {
        nodes: [issue]
    },
    labels: {
        nodes: [label]
    },
    milestones: {
        nodes: [milestone]
    }
})