'use strict';

/**
 * API helper utility
 */

const defaults = {
    version: 1,
    apiPrefix: 'api',
    versionPrefix: 'v',
    host: 'localhost',
    protocol: 'https',
    port: '443'
};

function API(options, assumeLocal) {
    [
        'version',
        'apiPrefix',
        'versionPrefix',
        'host',
        'protocol',
        'port'
    ].forEach(key => this[key] = options[key] || defaults[key]);
    this.port = this.port ? `:${this.port}` : this.port;

    this.assumeLocal = assumeLocal;
};

API.prototype.getRoutePrefix = function() {
    const isNode = typeof window === 'undefined';
    const host = !this.assumeLocal && isNode ? `${this.protocol}://${this.host}${this.port || ''}` : '';
    return `${host}/${this.apiPrefix}/${this.versionPrefix}${this.version}`;
};

API.prototype.getRoute = function(routeSuffix) {
    return `${this.getRoutePrefix()}${routeSuffix}`;
};

API.prototype.stripRoutePrefix = function(url) {
    let routePrefix = this.getRoutePrefix();
    let strippedURL = url;

    if (url.indexOf(routePrefix) == 0)
        strippedURL = url.replace(routePrefix, '');

    return strippedURL;
};

module.exports = API;
