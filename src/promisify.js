/**
 * Given a method which takes the last param as callback
 * returns promisified version of that method
 */

function promisify(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (err, ...rest) => {
                if (err)
                    return reject(err);

                return resolve(...rest);
            });
        });
    };
};

module.exports = promisify;
