export default {
    "cache": true,
    "concurrency": 5,
    "timeout": "30s",
    "failFast": true,
    "verbose": true,
    "files": ["tests/**/*.test.ts"],
    "extensions": ["ts"],
    "require": [
        "ts-node/register",
    ]
};
