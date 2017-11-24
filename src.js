const { execSync } = require('child_process');
const { clean, lt } = require('semver');

module.exports = (config, pluginConfig, callback) => {

    let latestVersion;
    let latestVersionCommitHash;

    let getVersion = function() {

        let refs = execSync('git show-ref --tags').toString('utf-8').trim().split('\n');

        refs.forEach(function(ref) {

            let [commitHash, refName] = ref.split(' ');
            let version = clean(refName.split('/')[2]);

            // version is null if not valid
            if (version && (!latestVersion || lt(latestVersion, version))) {

                latestVersion = version;
                latestVersionCommitHash = commitHash;
            }
        });
    };

    getVersion();

    if (!latestVersion) {

        execSync('git tag v0.0.0 && git push --tags');
    }

    getVersion();

    if (!latestVersion) {

        throw Error('There is no valid semver git tag. Create the first valid tag via "git tag v0.0.0" and then push it via "git push --tags".');
    }

    callback(null, {
        version: latestVersion,
        gitHead: latestVersionCommitHash
    });
};
