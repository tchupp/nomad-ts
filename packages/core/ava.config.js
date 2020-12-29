export default {
    "babel": {
        "extensions": ["ts"],
        "testOptions": {
            "presets": [
                ["module:@ava/babel/stage-4", false]
            ],
            "plugins": [
                "@babel/plugin-syntax-typescript",
            ],
        }
    },
    "cache": true,
    "concurrency": 5,
    "timeout": "30s",
    "failFast": true,
    "verbose": true,
    "files": ["tests/**/*.test.ts"],
    "require": [
        "ts-node/register",
    ]
};
